<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistItem extends Model
{
    protected $fillable = [
        'asset_type_id', 'label', 'input_type', 'required',
        'ok_value', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return ['required' => 'boolean', 'is_active' => 'boolean'];
    }

    public function assetType(): BelongsTo
    {
        return $this->belongsTo(AssetType::class);
    }
}
