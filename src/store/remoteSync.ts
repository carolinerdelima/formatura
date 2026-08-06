import { supabase } from '../lib/supabase';
import { normalize } from './persistence';
import type { AppState } from '../types';

const TABLE = 'formatura_state';
const ROW_ID = 'main';
/** Espera após a última mudança antes de gravar no Supabase, para não
 *  disparar uma requisição a cada tecla digitada. */
const DEBOUNCE_MS = 1500;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Busca o estado salvo no Supabase.
 * @returns O estado normalizado, ou `null` se o Supabase não estiver
 * configurado, a linha ainda não existir, ou a requisição falhar.
 */
export async function fetchRemoteState(): Promise<AppState | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from(TABLE)
        .select('data')
        .eq('id', ROW_ID)
        .maybeSingle();

    if (error) {
        console.error('Falha ao buscar estado remoto do Supabase:', error.message);
        return null;
    }
    if (!data?.data) return null;

    return normalize(data.data);
    }

    /** Agenda a gravação no Supabase. Chamadas sucessivas dentro da janela de
     *  debounce cancelam o envio anterior, mantendo só a mais recente. */
    export function scheduleRemoteSave(state: AppState): void {
    if (!supabase) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        void pushRemoteState(state);
    }, DEBOUNCE_MS);
}

async function pushRemoteState(state: AppState): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
        .from(TABLE)
        .upsert({ id: ROW_ID, data: state, updated_at: new Date().toISOString() });

    if (error) {
        console.error('Falha ao salvar estado no Supabase:', error.message);
    }
}