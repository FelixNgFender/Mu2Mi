'use server';

import {
    SeparationFormSchema,
    SeparationFormSchemaType,
    TrackSeparationModelInputSchema,
} from '../_schemas/changeme';

export const uploadLocalFile = async (formData: FormData) => {
    const data = Object.fromEntries(
        formData.entries(),
    ) as unknown as SeparationFormSchemaType;
    console.log('uploadLocalFile', data);
    const result = SeparationFormSchema.safeParse(data);

    if (!result.success) {
        return { success: result.success, error: result.error };
    }

    return { success: result.success, data: result.data };
};
