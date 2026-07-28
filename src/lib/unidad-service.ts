import { supabase } from './supabase';

// Persistencia del módulo unidad-aventura (Cuaderno de Inventor/a, Muro
// de Palabras, Misión en familia). Sigue el mismo patrón de acceso
// directo a Supabase que children-service.ts; no pasa por
// storage-simple.ts, que es el progreso/badges del formato de reto antiguo.

export interface ChildArtifact {
    id: string;
    child_id: string;
    unidad_id: string;
    tipo: string;
    contenido: Record<string, any>;
    depende_de: string[];
    moderation_status: 'pending' | 'approved' | 'rejected';
    moderation_notes: string | null;
    created_at: string;
}

export interface VocabularioEntry {
    palabra: string;
    unidad_id: string;
    coleccionada_en: string;
}

export interface FamilyMissionEntry {
    mision_id: string;
    unidad_id: string;
    completed_at: string;
    detalle?: string;
}

export const UnidadService = {
    /** Guarda el artefacto del paso "Crea" en el Cuaderno de Inventor/a. Queda `pending` de moderación. */
    async saveArtifact(childId: string, unidadId: string, tipo: string, contenido: Record<string, any>, dependeDe: string[] = []): Promise<{ data: ChildArtifact | null; error?: string }> {
        const { data, error } = await supabase
            .from('child_artifacts')
            .insert({ child_id: childId, unidad_id: unidadId, tipo, contenido, depende_de: dependeDe })
            .select()
            .single();

        if (error) {
            console.error('[UnidadService] saveArtifact error:', error);
            return { data: null, error: error.message };
        }
        return { data };
    },

    /** Todo el Cuaderno de un hijo/a (todos los estados de moderación, es su propio contenido). */
    async getCuaderno(childId: string): Promise<ChildArtifact[]> {
        const { data, error } = await supabase
            .from('child_artifacts')
            .select('*')
            .eq('child_id', childId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[UnidadService] getCuaderno error:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Borra una creación del Cuaderno (derecho de supresión). Requiere la
     * policy DELETE de supabase/migrations/005_child_artifacts_delete.sql —
     * sin ella, Supabase no da error pero tampoco borra ninguna fila (así
     * se descubrió el hueco: ver docs/mejora/06-auditoria-rls.md #3).
     */
    async deleteArtifact(artifactId: string): Promise<{ error?: string }> {
        const { error, count } = await supabase
            .from('child_artifacts')
            .delete({ count: 'exact' })
            .eq('id', artifactId);

        if (error) {
            console.error('[UnidadService] deleteArtifact error:', error);
            return { error: error.message };
        }
        if (count === 0) {
            return { error: 'No se pudo borrar (falta la policy de permisos en Supabase).' };
        }
        return {};
    },

    /** Añade palabras nuevas al Muro de Palabras del hijo/a (sin duplicar). */
    async collectPalabras(childId: string, unidadId: string, palabras: string[]): Promise<{ error?: string }> {
        const { data: child, error: fetchError } = await supabase
            .from('children')
            .select('vocabulary')
            .eq('id', childId)
            .single();

        if (fetchError) {
            console.error('[UnidadService] collectPalabras fetch error:', fetchError);
            return { error: fetchError.message };
        }

        const existentes: VocabularioEntry[] = child?.vocabulary || [];
        const yaColeccionadas = new Set(existentes.map(e => e.palabra));
        const nuevas: VocabularioEntry[] = palabras
            .filter(p => !yaColeccionadas.has(p))
            .map(palabra => ({ palabra, unidad_id: unidadId, coleccionada_en: new Date().toISOString() }));

        if (nuevas.length === 0) return {};

        const { error } = await supabase
            .from('children')
            .update({ vocabulary: [...existentes, ...nuevas], updated_at: new Date().toISOString() })
            .eq('id', childId);

        if (error) {
            console.error('[UnidadService] collectPalabras update error:', error);
            return { error: error.message };
        }
        return {};
    },

    /** Palabras coleccionadas por el hijo/a, para el Diccionario de Palabras Poderosas. */
    async getVocabulario(childId: string): Promise<VocabularioEntry[]> {
        const { data, error } = await supabase
            .from('children')
            .select('vocabulary')
            .eq('id', childId)
            .single();

        if (error) {
            console.error('[UnidadService] getVocabulario error:', error);
            return [];
        }
        return data?.vocabulary || [];
    },

    /** Registra una Misión en familia completada; queda visible en el Panel Familiar. */
    async completeFamilyMission(childId: string, misionId: string, unidadId: string, detalle?: string): Promise<{ error?: string }> {
        const { data: child, error: fetchError } = await supabase
            .from('children')
            .select('family_missions_completed')
            .eq('id', childId)
            .single();

        if (fetchError) {
            console.error('[UnidadService] completeFamilyMission fetch error:', fetchError);
            return { error: fetchError.message };
        }

        const existentes: FamilyMissionEntry[] = child?.family_missions_completed || [];
        const entry: FamilyMissionEntry = { mision_id: misionId, unidad_id: unidadId, completed_at: new Date().toISOString(), detalle };

        const { error } = await supabase
            .from('children')
            .update({ family_missions_completed: [...existentes, entry], updated_at: new Date().toISOString() })
            .eq('id', childId);

        if (error) {
            console.error('[UnidadService] completeFamilyMission update error:', error);
            return { error: error.message };
        }
        return {};
    },

    /** El "Comparte y colecciona": deja el artefacto pendiente de moderación (ya lo está por defecto al crearlo). */
    async submitToGallery(artifactId: string): Promise<{ error?: string }> {
        const { error } = await supabase
            .from('child_artifacts')
            .update({ moderation_status: 'pending' })
            .eq('id', artifactId);

        if (error) {
            console.error('[UnidadService] submitToGallery error:', error);
            return { error: error.message };
        }
        return {};
    },

    /** Artefactos ya aprobados, para la galería pública (sin datos identificativos). */
    async getGaleriaAprobada(): Promise<ChildArtifact[]> {
        const { data, error } = await supabase
            .from('child_artifacts')
            .select('*')
            .eq('moderation_status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[UnidadService] getGaleriaAprobada error:', error);
            return [];
        }
        return data || [];
    },

    /** Cola de moderación (uso del panel /admin/moderacion). */
    async getPendientesModeracion(): Promise<ChildArtifact[]> {
        const { data, error } = await supabase
            .from('child_artifacts')
            .select('*')
            .eq('moderation_status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[UnidadService] getPendientesModeracion error:', error);
            return [];
        }
        return data || [];
    },

    async moderar(artifactId: string, decision: 'approved' | 'rejected', notes?: string): Promise<{ error?: string }> {
        const { error } = await supabase
            .from('child_artifacts')
            .update({ moderation_status: decision, moderation_notes: notes || null })
            .eq('id', artifactId);

        if (error) {
            console.error('[UnidadService] moderar error:', error);
            return { error: error.message };
        }
        return {};
    },

    /** Insignia real: reutiliza el mismo array children.badges que el resto del sitio. */
    async awardBadge(childId: string, badgeId: string): Promise<{ error?: string }> {
        const { data: child, error: fetchError } = await supabase
            .from('children')
            .select('badges')
            .eq('id', childId)
            .single();

        if (fetchError) {
            console.error('[UnidadService] awardBadge fetch error:', fetchError);
            return { error: fetchError.message };
        }

        const existentes: string[] = child?.badges || [];
        if (existentes.includes(badgeId)) return {};

        const { error } = await supabase
            .from('children')
            .update({ badges: [...existentes, badgeId], updated_at: new Date().toISOString() })
            .eq('id', childId);

        if (error) {
            console.error('[UnidadService] awardBadge update error:', error);
            return { error: error.message };
        }
        return {};
    },

    /** Señales del módulo unidad-aventura para el Panel Familiar (parents.astro). */
    async getFamilyPanelData(childId: string): Promise<{ familyMissionsCompleted: FamilyMissionEntry[]; vocabularyCount: number }> {
        const { data, error } = await supabase
            .from('children')
            .select('family_missions_completed, vocabulary')
            .eq('id', childId)
            .single();

        if (error) {
            console.error('[UnidadService] getFamilyPanelData error:', error);
            return { familyMissionsCompleted: [], vocabularyCount: 0 };
        }
        return {
            familyMissionsCompleted: data?.family_missions_completed || [],
            vocabularyCount: (data?.vocabulary || []).length,
        };
    },

    /** Seudónimo determinista para la galería (nunca el nombre real del hijo/a). */
    seudonimoPara(childId: string): string {
        const ADJETIVOS = ['Curioso', 'Valiente', 'Rápida', 'Lista', 'Ingenioso', 'Creativa', 'Atenta', 'Audaz'];
        const ANIMALES = ['Zorro', 'Búho', 'Nutria', 'Lince', 'Colibrí', 'Erizo', 'Delfín', 'Puma'];
        let hash = 0;
        for (let i = 0; i < childId.length; i++) {
            hash = (hash * 31 + childId.charCodeAt(i)) >>> 0;
        }
        const adjetivo = ADJETIVOS[hash % ADJETIVOS.length];
        const animal = ANIMALES[Math.floor(hash / ADJETIVOS.length) % ANIMALES.length];
        return `${adjetivo} ${animal}`;
    },
};
