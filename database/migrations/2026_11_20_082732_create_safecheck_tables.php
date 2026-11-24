<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('asset_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('inspection_interval_days')->default(30);
            $table->timestamps();
        });

        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_type_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->enum('input_type', ['yes_no', 'number', 'text', 'choice'])->default('yes_no');
            $table->boolean('required')->default(true);
            $table->text('ok_value')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('qr_token', 64)->unique();
            $table->foreignId('asset_type_id')->constrained();
            $table->foreignId('area_id')->constrained();
            $table->string('location_note')->nullable();
            $table->date('expiry_date')->nullable();
            $table->date('next_due_date')->nullable();
            $table->string('status', 32)->default('OK');
            $table->timestamp('last_inspected_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['status', 'next_due_date']);
        });

        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->timestamp('inspected_at');
            $table->enum('result', ['ok', 'needs_action']);
            $table->text('notes')->nullable();
            $table->string('client_uuid', 36)->unique();
            $table->timestamps();
            $table->index(['asset_id', 'inspected_at']);
        });

        Schema::create('inspection_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('label_snapshot');
            $table->text('value');
            $table->boolean('is_ok');
            $table->timestamps();
        });

        Schema::create('inspection_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('entity');
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('changes')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('officer');
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active']);
        });
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('inspection_photos');
        Schema::dropIfExists('inspection_answers');
        Schema::dropIfExists('inspections');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('checklist_items');
        Schema::dropIfExists('asset_types');
        Schema::dropIfExists('areas');
    }
};
