<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'officer']), 403);
        $counts = Asset::where('is_active', true)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return response()->json([
            'counts' => [
                'OK' => (int) ($counts['OK'] ?? 0),
                'Perlu Tindak Lanjut' => (int) ($counts['Perlu Tindak Lanjut'] ?? 0),
                'Overdue' => (int) ($counts['Overdue'] ?? 0),
                'Expired' => (int) ($counts['Expired'] ?? 0),
            ],
            'assets' => Asset::with([
                'area',
                'assetType',
                'latestInspection.user:id,name',
                'latestInspection.answers',
                'latestInspection.photos',
            ])->where('is_active', true)->latest()->get(),
            'attention' => Asset::with([
                'area',
                'assetType',
                'latestInspection.user:id,name',
                'latestInspection.answers',
                'latestInspection.photos',
            ])->where('is_active', true)->whereIn('status', ['Perlu Tindak Lanjut', 'Overdue', 'Expired'])->latest()->limit(20)->get(),
            'expiring' => Asset::with(['area', 'assetType'])->where('is_active', true)->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(30)->toDateString()])->orderBy('expiry_date')->limit(20)->get(),
        ]);
    }
}
