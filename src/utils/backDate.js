// El back espera la fecha como instante; HU04 y HU05 ya usan medianoche UTC.
export const toBackDate = (date) => `${date}T00:00:00.000Z`