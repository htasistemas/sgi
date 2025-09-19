import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Client, EntityType, Status, System, Team } from '../models/entities';

export type ImportRow = Record<string, string | number | null | undefined>;

type NormalizedEntityMap = {
  teams: Team;
  systems: System;
  clients: Client;
  statuses: Status;
};

const normalizers: Record<EntityType, (row: ImportRow) => NormalizedEntityMap[EntityType] | null> = {
  teams: (row) => {
    const name = normalizeText(row['Nome'] ?? row['name']);
    if (!name) {
      return null;
    }
    return {
      name,
      email: normalizeText(row['Email'] ?? row['email']),
      phone: normalizePhone(row['Telefone'] ?? row['phone']),
      role: normalizeText(row['Função'] ?? row['role']),
    };
  },
  systems: (row) => {
    const name = normalizeText(row['Nome'] ?? row['name']);
    if (!name) {
      return null;
    }
    return {
      name,
      description: normalizeText(row['Descrição'] ?? row['description']),
    };
  },
  clients: (row) => {
    const name = normalizeText(row['Nome'] ?? row['name']);
    if (!name) {
      return null;
    }
    return {
      name,
      email: normalizeText(row['Email'] ?? row['email']),
      phone: normalizePhone(row['Telefone'] ?? row['phone']),
      company: normalizeText(row['Empresa'] ?? row['company']),
    };
  },
  statuses: (row) => {
    const name = normalizeText(row['Nome'] ?? row['name']);
    if (!name) {
      return null;
    }
    return {
      name,
      color: normalizeColor(row['Cor'] ?? row['color']),
    };
  },
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return undefined;
}

function normalizePhone(value: unknown): string | undefined {
  const text = normalizeText(value);
  if (!text) {
    return undefined;
  }
  const digits = text.replace(/\D/g, '');
  return digits.length > 0 ? digits : undefined;
}

function normalizeColor(value: unknown): string | undefined {
  const text = normalizeText(value);
  if (!text) {
    return undefined;
  }
  const hex = text.startsWith('#') ? text : `#${text}`;
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(hex) ? hex : undefined;
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  parse<T extends EntityType>(file: File, entity: T): Promise<NormalizedEntityMap[T][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows: ImportRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          const mapped = rows
            .map((row) => normalizers[entity](row))
            .filter((row): row is NormalizedEntityMap[T] => row !== null);
          resolve(mapped);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
}
