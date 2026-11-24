<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Asset;
use App\Models\AssetType;
use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SafeCheckSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@safecheck.local'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $officer = User::updateOrCreate(
            ['email' => 'petugas@safecheck.local'],
            [
                'name' => 'Petugas Lapangan',
                'password' => Hash::make('password'),
                'role' => 'officer',
                'is_active' => true,
            ]
        );

        $area = Area::firstOrCreate(['name' => 'Area Pilot']);
        $type = AssetType::firstOrCreate(
            ['name' => 'APAR'],
            ['inspection_interval_days' => 30]
        );

        $items = [
            'Jarum tekanan berada di zona hijau',
            'Segel/pin utuh',
            'Selang tidak retak',
            'Badan tidak berkarat atau penyok',
            'Label dan instruksi terbaca',
            'Posisi mudah dijangkau',
            'Tidak terhalang',
        ];
        foreach ($items as $index => $label) {
            ChecklistItem::updateOrCreate(
                ['asset_type_id' => $type->id, 'label' => $label],
                ['input_type' => 'yes_no', 'required' => true, 'ok_value' => 'ya', 'sort_order' => $index + 1, 'is_active' => true]
            );
        }

        $asset = Asset::updateOrCreate(
            ['code' => 'APAR-A1-001'],
            [
                'qr_token' => Str::random(32),
                'asset_type_id' => $type->id,
                'area_id' => $area->id,
                'location_note' => 'Dekat pintu utama',
                'expiry_date' => now()->addYear()->toDateString(),
                'next_due_date' => now()->addDays(30)->toDateString(),
                'status' => 'OK',
                'is_active' => true,
            ]
        );
    }
}
