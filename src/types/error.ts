// Interface genérica para o erro da API
export interface ApiError {
    code: string;    // Ex: "invalid_argument", "internal", "not_found"
    message: string; // Pode ser texto simples ou JSON stringificado
}

// Interface para erro de campo (validação)
export interface FieldError {
    field: string;
    error: string;
}

// Estrutura normalizada que seu app vai consumir
export interface ErrorResult {
    code: string;
    message: string;            // Mensagem amigável para exibir (Toast/Alert)
    fieldErrors: FieldError[];  // Array vazio se não houver erros de campo
}