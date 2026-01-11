import api from './axios';

export const updateLanguage = async (language: string) => {
    const res = await api.put('/api/auth/update-language', { language });
    return res.data;
};
