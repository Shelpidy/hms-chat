export const getResponseBody = (
    status: string,
    message?: string,
    data?: any
) => {
    return {
        status,
        message,
        data,
    };
};

export const responseStatusCode = {
    UNATHORIZED: 401,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNPROCESSIBLE_ENTITY: 422,
};

export const responseStatus = {
    SUCCESS: "success",
    ERROR: "error",
    UNATHORIZED: "unathorized",
    WARNING: "warning",
    UNPROCESSED: "unprocessed",
};
