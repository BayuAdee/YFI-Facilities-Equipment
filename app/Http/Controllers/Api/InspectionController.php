<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Inspection;
use App\Models\InspectionAnswer;
use App\Models\InspectionPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InspectionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'asset_id' => ['required', 'exists:assets,id'],
            'client_uuid' => ['required', 'string', 'max:36'],
            'notes' => ['nullable', 'string'],
            'answers' => ['required', 'array'],
            'photos.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $existing = Inspection::where('client_uuid', $data['client_uuid'])->first();
        if ($existing) {
            return response()->json(['inspection' => $existing->load(['answers', 'photos'])]);
        }

        $asset = Asset::with('assetType.checklistItems')->where('is_active', true)->findOrFail($data['asset_id']);
        $items = $asset->assetType->checklistItems->where('is_active', true)->keyBy('id');
        $needsAction = false;
        $answers = [];

        foreach ($items as $item) {
            $answer = collect($data['answers'])->firstWhere('checklist_item_id', (string) $item->id);
            if (! $answer) {
                $answer = collect($data['answers'])->firstWhere('checklist_item_id', $item->id);
            }
            if ($item->required && (! $answer || $answer['value'] === null || $answer['value'] === '')) {
                abort(422, 'Poin wajib belum terisi.');
            }
            $value = $answer['value'] ?? '';
            $isOk = $item->ok_value === null
                ? true
                : (string) $value === (string) $item->ok_value;
            if (! $isOk) {
                $needsAction = true;
            }
            $answers[] = [
                'checklist_item_id' => $item->id,
                'label_snapshot' => $item->label,
                'value' => (string) $value,
                'is_ok' => $isOk,
            ];
        }

        if ($needsAction && trim((string) $data['notes']) === '') {
            abort(422, 'Catatan wajib diisi jika ada poin yang tidak OK.');
        }

        $inspection = DB::transaction(function () use ($asset, $data, $answers, $needsAction, $request) {
            $inspection = Inspection::create([
                'asset_id' => $asset->id,
                'user_id' => $request->user()->id,
                'inspected_at' => now(),
                'result' => $needsAction ? 'needs_action' : 'ok',
                'notes' => $data['notes'] ?? null,
                'client_uuid' => $data['client_uuid'],
            ]);
            foreach ($answers as $answer) {
                InspectionAnswer::create(array_merge($answer, ['inspection_id' => $inspection->id]));
            }
            foreach ((array) $request->file('photos', []) as $photo) {
                $path = $photo->store('inspection-photos', 'public');
                InspectionPhoto::create(['inspection_id' => $inspection->id, 'path' => $path]);
            }

            $assetStatus = $needsAction ? 'Perlu Tindak Lanjut' : 'OK';
            if ($asset->expiry_date && $asset->expiry_date->isPast()) {
                $assetStatus = 'Expired';
            } elseif (! $needsAction && $asset->next_due_date && $asset->next_due_date->isPast()) {
                $assetStatus = 'Overdue';
            }

            $asset->update([
                'last_inspected_at' => now(),
                'next_due_date' => now()->addDays($asset->assetType->inspection_interval_days)->toDateString(),
                'status' => $assetStatus,
            ]);
            return $inspection;
        });

        return response()->json([
            'inspection' => $inspection->load(['answers', 'photos']),
            'status' => $asset->fresh()->status,
        ], 201);
    }
}
