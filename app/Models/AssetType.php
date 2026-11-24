<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetType extends Model
{
    protected $fillable = ['name', 'inspection_interval_days'];

    public function checklistItems(): HasMany
    {
        return $this->hasMany(ChecklistItem::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}
