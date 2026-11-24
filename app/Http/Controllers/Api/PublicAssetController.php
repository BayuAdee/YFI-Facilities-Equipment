<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;

class PublicAssetController extends Controller
{
    public function show(string $token)
    {
        $asset = Asset::where('qr_token', $token)->where('is_active', true)
            ->with(['area:id,name', 'assetType:id,name'])
            ->firstOrFail();

        return response()->json([
            'asset' => [
                'code' => $asset->code,
                'type' => $asset->assetType->name,
                'area' => $asset->area->name,
                'location_note' => $asset->location_note,
                'status' => $asset->status,
                'expiry_date' => $asset->expiry_date?->toDateString(),
                'last_inspected_at' => $asset->last_inspected_at?->toIso8601String(),
                'next_due_date' => $asset->next_due_date?->toDateString(),
            ],
        ]);
    }

    public function inspections(string $token)
    {
        $asset = Asset::where('qr_token', $token)->where('is_active', true)->firstOrFail();
        $inspections = $asset->inspections()
            ->with('user:id,name')
            ->latest('inspected_at')
            ->paginate(10);

        $inspections->getCollection()->transform(fn ($inspection) => [
            'inspected_at' => $inspection->inspected_at->toIso8601String(),
            'result' => $inspection->result,
            'officer' => $inspection->user->name,
        ]);

        return response()->json($inspections);
    }
}
