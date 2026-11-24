<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionAnswer extends Model
{
    protected $fillable = [
        'inspection_id', 'checklist_item_id', 'label_snapshot', 'value', 'is_ok',
    ];

    protected function casts(): array
    {
        return ['is_ok' => 'boolean'];
    }
}
