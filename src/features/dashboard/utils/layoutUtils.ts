import type { Subject } from "@/types/dashboard";

export interface DashboardRow {
    subjects: Subject[];
    totalSlots: number;
}

/**
 * Agrupa os subjects em linhas de até 3 slots.
 * Regras:
 * - 'large' (3 slots): Ocupa a linha inteira.
 * - 'medium' (2 slots, mas agora tratado como 3): Ocupa a linha inteira para garantir visual horizontal.
 * - 'small' (1 slot): Tenta agrupar até 3 na mesma linha.
 * - Gaps: Prioriza preencher a linha de 'small' buscando itens à frente na lista (ignora ordem sequencial).
 */
export const groupSubjectsIntoRows = (subjects: Subject[]): DashboardRow[] => {
    const rows: DashboardRow[] = [];
    // Criamos uma cópia para poder manipular (remover itens já alocados)
    const unassigned = [...subjects];

    const getSlots = (size: string): number => {
        switch (size) {
            case 'small': return 1;
            case 'medium': return 3; // Alterado para 3 slots para ser "horizontal sozinho"
            case 'large': return 3;
            default: return 1;
        }
    };

    while (unassigned.length > 0) {
        // Pega o próximo item disponível seguindo a ordem original
        const subject = unassigned.shift()!;
        const slotsNeeded = getSlots(subject.size);

        if (slotsNeeded === 3) {
            // Widgets grandes ou médios (na nova regra) ocupam a linha toda sozinhos
            rows.push({ subjects: [subject], totalSlots: 3 });
        } else {
            // É um widget pequeno (1 slot). Tenta preencher a linha com outros pequenos.
            const rowSubjects = [subject];
            let currentSlots = 1;

            // Busca exaustiva por outros 'small' na lista restante (ignora ordem para preencher gaps)
            let i = 0;
            while (i < unassigned.length && currentSlots < 3) {
                if (getSlots(unassigned[i].size) === 1) {
                    // Remove o item encontrado da lista de não atribuídos
                    const found = unassigned.splice(i, 1)[0];
                    rowSubjects.push(found);
                    currentSlots += 1;
                } else {
                    // Se não for small, continua procurando no próximo
                    i++;
                }
            }
            rows.push({ subjects: rowSubjects, totalSlots: 3 }); // Marcamos como 3 slots ocupados (mesmo que haja só 1 ou 2, a linha é dele)
        }
    }

    return rows;
};
