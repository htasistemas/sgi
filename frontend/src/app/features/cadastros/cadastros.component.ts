import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ImportService } from '../../core/services/import.service';
import { Client, EntityType, Status, System, Team } from '../../core/models/entities';

type EntityRecord = {
  teams: Team;
  systems: System;
  clients: Client;
  statuses: Status;
};

type FieldConfig = {
  key: keyof (Team & System & Client & Status);
  label: string;
  type?: string;
  required?: boolean;
};

type EntityConfig<T extends EntityType> = {
  title: string;
  emptyMessage: string;
  fields: FieldConfig[];
};

const ENTITY_CONFIG: Record<EntityType, EntityConfig<EntityType>> = {
  teams: {
    title: 'Equipe',
    emptyMessage: 'Cadastre integrantes da equipe para organizar responsabilidades.',
    fields: [
      { key: 'name', label: 'Nome', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'role', label: 'Função' },
    ],
  },
  systems: {
    title: 'Sistemas',
    emptyMessage: 'Cadastre os sistemas disponíveis para vincular aos projetos.',
    fields: [
      { key: 'name', label: 'Nome', required: true },
      { key: 'description', label: 'Descrição' },
    ],
  },
  clients: {
    title: 'Clientes',
    emptyMessage: 'Cadastre clientes para associar projetos e acompanhamentos.',
    fields: [
      { key: 'name', label: 'Nome', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'company', label: 'Empresa' },
    ],
  },
  statuses: {
    title: 'Status',
    emptyMessage: 'Cadastre status personalizados para acompanhar os projetos.',
    fields: [
      { key: 'name', label: 'Nome', required: true },
      { key: 'color', label: 'Cor (hex)', type: 'color' },
    ],
  },
};

@Component({
  selector: 'sgi-cadastros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss'],
})
export class CadastrosComponent implements OnInit {
  protected readonly ENTITY_CONFIG = ENTITY_CONFIG;
  protected readonly entities: EntityType[] = ['teams', 'systems', 'clients', 'statuses'];
  protected readonly config = computed(() => ENTITY_CONFIG[this.selectedEntity()]);
  protected readonly selectedEntity = signal<EntityType>('teams');
  protected readonly items = signal<Array<EntityRecord[EntityType]>>([]);
  protected readonly isLoading = signal(false);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected form!: FormGroup;
  protected editingId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly importer: ImportService,
  ) {}

  ngOnInit(): void {
    this.resetForm('teams');
    this.loadData('teams');
  }

  protected selectEntity(entity: EntityType): void {
    if (this.selectedEntity() === entity) {
      return;
    }
    this.resetForm(entity);
    this.loadData(entity);
  }

  protected async loadData(entity: EntityType = this.selectedEntity()): Promise<void> {
    this.isLoading.set(true);
    this.feedbackMessage.set(null);
    try {
      const data = await firstValueFrom(this.api.list(entity));
      this.items.set(data);
    } catch (error) {
      console.error('Failed to load data', error);
      this.feedbackMessage.set('Não foi possível carregar os dados. Verifique a API.');
      this.items.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const entity = this.selectedEntity();
    const payload = this.form.getRawValue();
    try {
      if (this.editingId) {
        await firstValueFrom(this.api.update(entity, this.editingId, payload));
        this.feedbackMessage.set('Registro atualizado com sucesso.');
      } else {
        await firstValueFrom(this.api.create(entity, payload));
        this.feedbackMessage.set('Registro criado com sucesso.');
      }
      this.resetForm(entity);
      await this.loadData(entity);
    } catch (error) {
      console.error('Failed to persist entity', error);
      this.feedbackMessage.set('Não foi possível salvar o registro. Verifique os dados e a API.');
    }
  }

  protected edit(item: EntityRecord[EntityType]): void {
    const entity = this.selectedEntity();
    this.editingId = item.id ?? null;
    this.form.reset();
    this.form.patchValue(item);
    this.feedbackMessage.set(null);
    this.items.update((current) => current);
  }

  protected cancelEditing(): void {
    this.editingId = null;
    this.form.reset();
  }

  protected async remove(item: EntityRecord[EntityType]): Promise<void> {
    if (!item.id) {
      return;
    }
    const entity = this.selectedEntity();
    try {
      await firstValueFrom(this.api.delete(entity, item.id));
      this.feedbackMessage.set('Registro removido com sucesso.');
      await this.loadData(entity);
    } catch (error) {
      console.error('Failed to delete entity', error);
      this.feedbackMessage.set('Não foi possível remover o registro.');
    }
  }

  protected async handleImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) {
      return;
    }
    const entity = this.selectedEntity();
    this.isLoading.set(true);
    this.feedbackMessage.set(null);
    try {
      const rows = await this.importer.parse(file, entity);
      await Promise.all(rows.map((row) => firstValueFrom(this.api.create(entity, row))));
      this.feedbackMessage.set(`${rows.length} registros importados com sucesso.`);
      await this.loadData(entity);
    } catch (error) {
      console.error('Failed to import data', error);
      this.feedbackMessage.set('Não foi possível importar o arquivo. Confira o formato e tente novamente.');
    } finally {
      this.isLoading.set(false);
      input.value = '';
    }
  }

  protected getFieldValue(item: EntityRecord[EntityType], key: FieldConfig['key']): unknown {
    return (item as unknown as Record<string, unknown>)[key];
  }

  protected getDisplayValue(item: EntityRecord[EntityType], key: FieldConfig['key']): string {
    const value = this.getFieldValue(item, key);
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  protected getColorValue(item: EntityRecord[EntityType], key: FieldConfig['key']): string {
    const value = this.getFieldValue(item, key);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return '#6c757d';
  }

  protected startNew(): void {
    this.resetForm(this.selectedEntity());
  }

  private resetForm(entity: EntityType): void {
    this.selectedEntity.set(entity);
    this.editingId = null;
    this.form = this.createForm(entity);
    this.feedbackMessage.set(null);
  }

  private createForm(entity: EntityType): FormGroup {
    const controls = ENTITY_CONFIG[entity].fields.reduce<Record<string, unknown>>((acc, field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      acc[field.key] = ['', validators];
      return acc;
    }, {});
    return this.fb.group(controls);
  }
}
