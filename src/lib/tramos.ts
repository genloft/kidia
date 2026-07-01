// Los 3 tramos de edad del Método Kidia (ver Kidia_Metodologia_Aprendizaje.docx).
// El tramo de un hijo se calcula automáticamente por su fecha de nacimiento;
// no es un producto que se compre por separado (eso es la suscripción familiar,
// ver subscription-service.ts).

export type TramoId = '8-9' | '10-11' | '12-14';

export interface Tramo {
    id: TramoId;
    label: string;
    ageMin: number;
    ageMax: number;
    piaget: string;
    sesion: string;
    autonomia: string;
    andamiaje: string;
    personajes: string;
    descripcion: string;
}

export const TRAMOS: Tramo[] = [
    {
        id: '8-9',
        label: '8-9 años',
        ageMin: 8,
        ageMax: 9,
        piaget: 'Operaciones concretas',
        sesion: '15-20 min',
        autonomia: 'Guiada paso a paso',
        andamiaje: 'Intenso y constante',
        personajes: 'Solo Dra. Vael',
        descripcion: 'Muy visual y narrativo. Cada reto termina en un pequeño producto mostrable, con la Dra. Vael acompañando en cada paso.'
    },
    {
        id: '10-11',
        label: '10-11 años',
        ageMin: 10,
        ageMax: 11,
        piaget: 'Operaciones concretas (transición)',
        sesion: '25-30 min',
        autonomia: 'Semiguiada, primeras decisiones',
        andamiaje: 'Medio, se retira a ratos',
        personajes: 'Dra. Vael',
        descripcion: 'Aparecen las primeras decisiones propias y los mini-proyectos de varios pasos, comparando y mejorando versiones.'
    },
    {
        id: '12-14',
        label: '12-14 años',
        ageMin: 12,
        ageMax: 14,
        piaget: 'Operaciones formales',
        sesion: '35-45 min',
        autonomia: 'Alta: el niño dirige',
        andamiaje: 'Mínimo, a demanda',
        personajes: 'Dra. Vael + Morti',
        descripcion: 'Proyectos completos con ayuda a demanda. Aparece Morti para trabajar ética y sesgos con más profundidad.'
    }
];

export function calcAge(birthDate: string): number {
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function tramoForAge(age: number): Tramo | null {
    return TRAMOS.find(t => age >= t.ageMin && age <= t.ageMax)
        || (age < TRAMOS[0].ageMin ? TRAMOS[0] : null)
        || (age > TRAMOS[TRAMOS.length - 1].ageMax ? TRAMOS[TRAMOS.length - 1] : null);
}

export function tramoForChild(birthDate: string | null): Tramo | null {
    if (!birthDate) return null;
    return tramoForAge(calcAge(birthDate));
}
