// Mock Supabase client to prevent build errors while you migrate to Firebase
// This allows the template to compile without @supabase/supabase-js

const chainable = {
  select: () => chainable,
  insert: () => chainable,
  update: () => chainable,
  delete: () => chainable,
  eq: () => chainable,
  order: () => chainable,
  single: () => ({ data: null, error: null }),
  then: (resolve) => resolve({ data: [], error: null }),
};

export const supabase = {
  from: () => chainable,
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
};
