<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Asset extends Model
{
    protected $fillable = [
        'code', 'qr_token', 'asset_type_id', 'area_id', 'location_note',
        'expiry_date', 'next_due_date', 'status', 'last_inspected_at',
        'is_active', 'meta',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'next_due_date' => 'date',
            'last_inspected_at' => 'datetime',
            'is_active' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function assetType(): BelongsTo
    {
        return $this->belongsTo(AssetType::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }

    public function latestInspection(): HasOne
    {
        return $this->hasOne(Inspection::class)->latestOfMany('inspected_at');
    }
}
