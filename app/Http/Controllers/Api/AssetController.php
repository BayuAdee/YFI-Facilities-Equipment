<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class AssetController extends Controller
{
    public function byToken(string $token)
    {
        $asset = Asset::where('qr_token', $token)->where('is_active', true)
            ->with(['area', 'assetType.checklistItems' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->firstOrFail();

        $history = $asset->inspections()->with(['user:id,name', 'answers', 'photos'])
            ->latest('inspected_at')->paginate(10);

        return response()->json([
            'asset' => $asset,
            'checklist' => $asset->assetType->checklistItems,
            'history' => $history,
        ]);
    }

    public function index(Request $request)
    {
        $query = Asset::with(['area', 'assetType']);
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('area_id')) {
            $query->where('area_id', $request->area_id);
        }
        return response()->json($query->latest()->paginate(100));
    }

    public function store(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);
        $data = $request->validate([
            'code' => ['required', 'string', 'max:100', 'unique:assets,code'],
            'asset_type_id' => ['required', 'exists:asset_types,id'],
            'area_id' => ['required', 'exists:areas,id'],
            'location_note' => ['nullable', 'string'],
            'expiry_date' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
        ]);
        $type = \App\Models\AssetType::findOrFail($data['asset_type_id']);
        $data['qr_token'] = Str::random(32);
        $data['next_due_date'] = now()->addDays($type->inspection_interval_days)->toDateString();
        $data['status'] = 'OK';
        $asset = Asset::create($data);
        return response()->json($asset->load(['area', 'assetType']), 201);
    }

    public function resetToken(Request $request, Asset $asset)
    {
        abort_unless($request->user()?->role === 'admin', 403);
        $asset->update(['qr_token' => Str::random(32)]);
        return response()->json(['qr_token' => $asset->qr_token]);
    }

    public function label(Request $request, Asset $asset)
    {
        abort_unless($request->user()?->role === 'admin', 403);
        $url = rtrim(config('app.url'), '/') . '/a/' . $asset->qr_token;
        $result = (new PngWriter())->write(
            new QrCode(data: $url, size: 1080, margin: 80)
        );

        return response($result->getString())
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'attachment; filename="' . $asset->code . '-1080.png"');
    }

    public function destroy(Request $request, Asset $asset)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $asset->update(['is_active' => false]);

        return response()->json([
            'message' => "Alat keselamatan \"{$asset->code}\" berhasil dinonaktifkan (diarsipkan). Seluruh riwayat inspeksi tetap tersimpan sebagai bukti audit K3.",
        ]);
    }

    public function restore(Request $request, Asset $asset)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $asset->update(['is_active' => true]);

        return response()->json([
            'message' => "Alat keselamatan \"{$asset->code}\" berhasil diaktifkan kembali.",
        ]);
    }

    public function resolve(Request $request, Asset $asset)
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'officer']), 403);

        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $repairNote = ! empty(trim((string) ($data['notes'] ?? '')))
            ? trim((string) $data['notes'])
            : 'Telah diperbaiki dan diverifikasi oleh petugas.';

        $asset->update([
            'status' => 'OK',
            'meta' => array_merge($asset->meta ?? [], [
                'last_repaired_at' => now()->toIso8601String(),
                'repaired_by_user_id' => $request->user()->id,
                'repaired_by_name' => $request->user()->name,
                'repair_notes' => $repairNote,
            ]),
        ]);

        return response()->json([
            'message' => "Alat \"{$asset->code}\" telah berhasil ditandai selesai diperbaiki dan status kembali OK / Normal.",
            'asset' => $asset->fresh(['area', 'assetType', 'latestInspection.user', 'latestInspection.answers', 'latestInspection.photos']),
        ]);
    }
}
