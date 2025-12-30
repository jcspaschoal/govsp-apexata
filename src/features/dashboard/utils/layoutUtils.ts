/* eslint-disable */
// @ts-nocheck

import type { Subject } from "@/types/dashboard";

export interface DashboardItem {
    subject: Subject;
    renderSize: number;
}

export interface DashboardRow {
    items: DashboardItem[];
}

/**
 * Agrupa os subjects em linhas de até 3 slots.
 * Regras:
 * - 'large' (3 slots): Ocupa a linha inteira.
 * - 'medium' (2 slots): Ocupa 2 slots se houver um 'small' para completar a linha (3 slots),
 *   caso contrário ocupa a linha inteira (3 slots).
 * - 'small' (1 slot): Tenta agrupar até 3 na mesma linha ou 1 com um 'medium'.
 * - Gaps: Prioriza preencher a linha buscando itens à frente na lista (look-ahead).
 */
export const groupSubjectsIntoRows = (subjects: Subject[]): DashboardRow[] => {
    const rows: DashboardRow[] = [];
    const unassigned = [...subjects];

    while (unassigned.length > 0) {
        const current = unassigned.shift()!;
        
        if (current.size === 'large') {
            rows.push({
                items: [{ subject: current, renderSize: 3 }]
            });
            continue;
        }

        if (current.size === 'medium') {
            // Tenta achar um small para acompanhar
            const smallIdx = unassigned.findIndex(s => s.size === 'small');
            if (smallIdx !== -1) {
                const small = unassigned.splice(smallIdx, 1)[0];
                rows.push({
                    items: [
                        { subject: current, renderSize: 2 },
                        { subject: small, renderSize: 1 }
                    ]
                });
            } else {
                // Sozinho ocupa 3
                rows.push({
                    items: [{ subject: current, renderSize: 3 }]
                });
            }
            continue;
        }

        if (current.size === 'small') {
            // Tenta achar mais smalls (máximo 3 no total)
            const rowItems: DashboardItem[] = [{ subject: current, renderSize: 1 }];
            
            // Procura segundo item
            let foundSecond = false;
            // Primeiro tenta outro small
            const secondSmallIdx = unassigned.findIndex(s => s.size === 'small');
            if (secondSmallIdx !== -1) {
                const secondSmall = unassigned.splice(secondSmallIdx, 1)[0];
                rowItems.push({ subject: secondSmall, renderSize: 1 });
                foundSecond = true;

                // Tenta achar terceiro item (tem que ser small)
                const thirdSmallIdx = unassigned.findIndex(s => s.size === 'small');
                if (thirdSmallIdx !== -1) {
                    const thirdSmall = unassigned.splice(thirdSmallIdx, 1)[0];
                    rowItems.push({ subject: thirdSmall, renderSize: 1 });
                }
            } else {
                // Se não achou segundo small, tenta um medium
                const mediumIdx = unassigned.findIndex(s => s.size === 'medium');
                if (mediumIdx !== -1) {
                    const medium = unassigned.splice(mediumIdx, 1)[0];
                    rowItems.push({ subject: medium, renderSize: 2 });
                    foundSecond = true;
                }
            }
            
            rows.push({ items: rowItems });
        }
    }

    return rows;
};
