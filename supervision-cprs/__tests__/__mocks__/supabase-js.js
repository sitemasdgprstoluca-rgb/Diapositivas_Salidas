// Minimal Supabase client mock
const mockClient = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
    signUp: jest.fn(() => Promise.resolve({ error: null })),
    signOut: jest.fn(() => Promise.resolve()),
    startAutoRefresh: jest.fn(),
    stopAutoRefresh: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn(() => Promise.resolve({ error: null })),
    upsert: jest.fn(() => Promise.resolve({ error: null })),
    update: jest.fn(() => Promise.resolve({ error: null })),
    delete: jest.fn(() => Promise.resolve({ error: null })),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null })),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ error: null })),
      createSignedUrl: jest.fn(() => Promise.resolve({ data: { signedUrl: 'https://mock/signed' } })),
    })),
  },
};

module.exports = {
  createClient: jest.fn(() => mockClient),
};
