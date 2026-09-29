import { BusinessRuleError } from '../services/referral.service.js';
export const errorHandler = (err, _req, res, _next) => {
    const timestamp = new Date().toISOString();
    if (err instanceof BusinessRuleError) {
        const response = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
            meta: {
                timestamp,
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle express JSON body parsing error
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        const response = {
            success: false,
            error: {
                code: 'MALFORMED_JSON',
                message: 'Request payload contains malformed JSON.',
            },
            meta: {
                timestamp,
            },
        };
        res.status(400).json(response);
        return;
    }
    // Generic 500 without leaking stack traces
    console.error('[CareLoop Server Error]:', err);
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected operational error occurred while processing the request.',
        },
        meta: {
            timestamp,
        },
    };
    res.status(500).json(response);
};
