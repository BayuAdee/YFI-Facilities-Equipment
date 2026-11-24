<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\AssetType;
use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MasterController extends Controller
{
    private function admin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }

    public function areas(Request $request)
    {
        $this->admin($request);
        if ($request->isMethod('post')) {
            $data = $request->validate(['name' => ['required', 'string', 'max:100']]);

            return response()->json(Area::create($data), 201);
        }

        return response()->json(Area::orderBy('name')->get());
    }

    public function deleteArea(Request $request, Area $area)
    {
        $this->admin($request);

        $assetCount = \App\Models\Asset::where('area_id', $area->id)->count();
        if ($assetCount > 0) {
            return response()->json([
                'message' => "Area \"{$area->name}\" tidak dapat dihapus karena masih digunakan oleh {$assetCount} alat keselamatan.",
            ], 422);
        }

        $area->delete();

        return response()->json(['message' => 'Area berhasil dihapus.']);
    }

    public function assetTypes(Request $request)
    {
        $this->admin($request);
        if ($request->isMethod('post')) {
            $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'inspection_interval_days' => ['required', 'integer', 'min:1']]);

            return response()->json(AssetType::create($data), 201);
        }

        return response()->json(AssetType::with('checklistItems')->orderBy('name')->get());
    }

    public function checklist(Request $request)
    {
        $this->admin($request);
        if ($request->isMethod('post')) {
            $data = $request->validate([
                'asset_type_id' => ['required', 'exists:asset_types,id'],
                'label' => ['required', 'string', 'max:255'],
                'input_type' => ['required', 'in:yes_no,number,text,choice'],
                'required' => ['boolean'],
                'ok_value' => ['nullable', 'string'],
                'sort_order' => ['integer', 'min:0'],
            ]);
            $data['is_active'] = true;

            return response()->json(ChecklistItem::create($data), 201);
        }

        $query = ChecklistItem::with('assetType:id,name')->orderBy('sort_order')->orderBy('id');
        if ($request->filled('asset_type_id')) {
            $query->where('asset_type_id', $request->asset_type_id);
        }

        return response()->json($query->get());
    }

    public function updateChecklistItem(Request $request, ChecklistItem $checklistItem)
    {
        $this->admin($request);
        $data = $request->validate([
            'asset_type_id' => ['required', 'exists:asset_types,id'],
            'label' => ['required', 'string', 'max:255'],
            'input_type' => ['required', 'in:yes_no,number,text,choice'],
            'required' => ['boolean'],
            'ok_value' => ['nullable', 'string'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $checklistItem->update($data);

        return response()->json($checklistItem->load('assetType:id,name'));
    }

    public function deleteChecklistItem(Request $request, ChecklistItem $checklistItem)
    {
        $this->admin($request);
        $checklistItem->delete();

        return response()->json(['ok' => true]);
    }

    public function users(Request $request)
    {
        $this->admin($request);
        if ($request->isMethod('post')) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:100'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['required', 'in:admin,officer'],
            ]);
            $data['password'] = Hash::make($data['password']);
            $data['is_active'] = true;

            return response()->json(User::create($data), 201);
        }

        return response()->json(User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')->orderBy('id')->get());
    }

    public function updateUser(Request $request, User $user)
    {
        $this->admin($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'in:admin,officer'],
            'is_active' => ['required', 'boolean'],
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user->fresh());
    }

    public function deleteUser(Request $request, User $user)
    {
        $this->admin($request);
        if ($request->user()->id === $user->id) {
            abort(422, 'Tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->inspections()->exists()) {
            abort(422, 'Pengguna tidak dapat dihapus permanen karena memiliki riwayat inspeksi K3. Silakan ubah status akun menjadi Nonaktif.');
        }

        $user->delete();

        return response()->json(['ok' => true]);
    }
}
