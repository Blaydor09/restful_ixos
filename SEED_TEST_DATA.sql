-- =============================================================================
-- SEED DATA — Test Users, Artists, Songs, and Moods
-- =============================================================================
-- Este archivo contiene datos de prueba para desarrollo y testing
-- Ejecutar después de ejecutar database.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS (sin contraseña - solo para testing)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, username, email, display_name, avatar_url, password_hash, last_login_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'juantest', 'juan@test.com', 'Juan Pérez', 'https://i.pravatar.cc/150?img=1', '$2a$10$abc123xyz', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'mariatest', 'maria@test.com', 'María García', 'https://i.pravatar.cc/150?img=2', '$2a$10$def456uvw', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'carlostest', 'carlos@test.com', 'Carlos López', 'https://i.pravatar.cc/150?img=3', '$2a$10$ghi789rst', NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- ARTISTS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO artists (id, name, image_url) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'The Weeknd', 'https://i.scdn.co/image/ab6761610000e5eb4f45456d1e88f1dcf4c406b8'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Billie Eilish', 'https://i.scdn.co/image/ab67616100005174ef302e4d4106cdf4fcbee834'),
    ('650e8400-e29b-41d4-a716-446655440003', 'Bad Bunny', 'https://i.scdn.co/image/ab676161000051740b253995ff2caf57934eb46c'),
    ('650e8400-e29b-41d4-a716-446655440004', 'Taylor Swift', 'https://i.scdn.co/image/ab67616d0000b2735d53782218a71e0e9cf87855'),
    ('650e8400-e29b-41d4-a716-446655440005', 'Ariana Grande', 'https://i.scdn.co/image/ab67616d00001e02a8f58a37a2f9b3a2e48d7ce4'),
    ('650e8400-e29b-41d4-a716-446655440006', 'Dua Lipa', 'https://i.scdn.co/image/ab67616d00001e02d2f0dd5d9e8e4d5f87e3a6e8');

-- ─────────────────────────────────────────────────────────────────────────────
-- ALBUMS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO albums (id, title, artist_id, cover_url, release_year) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'After Hours', '650e8400-e29b-41d4-a716-446655440001', 'https://i.scdn.co/image/ab67616d0000b273f8dd0e6f5e5e5e5e5e5e5e5e', 2020),
    ('750e8400-e29b-41d4-a716-446655440002', 'Happier Than Ever', '650e8400-e29b-41d4-a716-446655440002', 'https://i.scdn.co/image/ab67616d0000b2735e5e5e5e5e5e5e5e5e5e5e5e', 2021),
    ('750e8400-e29b-41d4-a716-446655440003', 'Un x 100to', '650e8400-e29b-41d4-a716-446655440003', 'https://i.scdn.co/image/ab67616d0000b2734f4f4f4f4f4f4f4f4f4f4f4f', 2022),
    ('750e8400-e29b-41d4-a716-446655440004', 'Midnights', '650e8400-e29b-41d4-a716-446655440004', 'https://i.scdn.co/image/ab67616d0000b2735a5a5a5a5a5a5a5a5a5a5a5a', 2022),
    ('750e8400-e29b-41d4-a716-446655440005', 'Eternal Sunshine', '650e8400-e29b-41d4-a716-446655440005', 'https://i.scdn.co/image/ab67616d0000b2735b5b5b5b5b5b5b5b5b5b5b5b', 2024),
    ('750e8400-e29b-41d4-a716-446655440006', 'Future Nostalgia', '650e8400-e29b-41d4-a716-446655440006', 'https://i.scdn.co/image/ab67616d0000b2735c5c5c5c5c5c5c5c5c5c5c5c', 2020);

-- ─────────────────────────────────────────────────────────────────────────────
-- SONGS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO songs (id, file_id, file_path, cdn_url, title, artist_id, album_id, cover_url, release_year, duration_s, explicit, play_count) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '550e8400-001.mp3', 'music/550e8400-001.mp3', 'https://audio.spotify.com/blinding-lights', 'Blinding Lights', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'https://i.scdn.co/image/ab67616d0000b273f8dd0e6f5e5e5e5e5e5e5e5e', 2019, 200.34, true, 245),
    ('850e8400-e29b-41d4-a716-446655440002', '550e8400-002.mp3', 'music/550e8400-002.mp3', 'https://audio.spotify.com/when-we-were-young', 'When We Were Young', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'https://i.scdn.co/image/ab67616d0000b2735e5e5e5e5e5e5e5e5e5e5e5e', 2021, 192.45, false, 189),
    ('850e8400-e29b-41d4-a716-446655440003', '550e8400-003.mp3', 'music/550e8400-003.mp3', 'https://audio.spotify.com/tití-me-preguntó', 'Tití Me Preguntó', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 'https://i.scdn.co/image/ab67616d0000b2734f4f4f4f4f4f4f4f4f4f4f4f', 2022, 268.56, true, 312),
    ('850e8400-e29b-41d4-a716-446655440004', '550e8400-004.mp3', 'music/550e8400-004.mp3', 'https://audio.spotify.com/midnight-rain', 'Midnight Rain', '650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', 'https://i.scdn.co/image/ab67616d0000b2735a5a5a5a5a5a5a5a5a5a5a5a', 2022, 174.23, false, 267),
    ('850e8400-e29b-41d4-a716-446655440005', '550e8400-005.mp3', 'music/550e8400-005.mp3', 'https://audio.spotify.com/eternal-sunshine', 'Eternal Sunshine', '650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440005', 'https://i.scdn.co/image/ab67616d0000b2735b5b5b5b5b5b5b5b5b5b5b5b', 2024, 212.67, false, 156),
    ('850e8400-e29b-41d4-a716-446655440006', '550e8400-006.mp3', 'music/550e8400-006.mp3', 'https://audio.spotify.com/levitating', 'Levitating', '650e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440006', 'https://i.scdn.co/image/ab67616d0000b2735c5c5c5c5c5c5c5c5c5c5c5c', 2020, 203.23, false, 298),
    ('850e8400-e29b-41d4-a716-446655440007', '550e8400-007.mp3', 'music/550e8400-007.mp3', 'https://audio.spotify.com/save-your-tears', 'Save Your Tears', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'https://i.scdn.co/image/ab67616d0000b273f8dd0e6f5e5e5e5e5e5e5e5e', 2021, 215.34, true, 223),
    ('850e8400-e29b-41d4-a716-446655440008', '550e8400-008.mp3', 'music/550e8400-008.mp3', 'https://audio.spotify.com/my-future', 'My Future', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'https://i.scdn.co/image/ab67616d0000b2735e5e5e5e5e5e5e5e5e5e5e5e', 2019, 186.45, false, 198),
    ('850e8400-e29b-41d4-a716-446655440009', '550e8400-009.mp3', 'music/550e8400-009.mp3', 'https://audio.spotify.com/bad-idea', 'Bad Idea', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 'https://i.scdn.co/image/ab67616d0000b2734f4f4f4f4f4f4f4f4f4f4f4f', 2023, 245.12, false, 287),
    ('850e8400-e29b-41d4-a716-446655440010', '550e8400-010.mp3', 'music/550e8400-010.mp3', 'https://audio.spotify.com/anti-hero', 'Anti-Hero', '650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', 'https://i.scdn.co/image/ab67616d0000b2735a5a5a5a5a5a5a5a5a5a5a5a', 2022, 200.89, true, 334);

-- ─────────────────────────────────────────────────────────────────────────────
-- SONG_GENRES (asociar géneros a canciones)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO song_genres (song_id, genre_id) VALUES
    -- Blinding Lights (Pop, Electronic)
    ('850e8400-e29b-41d4-a716-446655440001', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440001', (SELECT id FROM genres WHERE name = 'Electronic')),
    
    -- When We Were Young (Alternative, Pop)
    ('850e8400-e29b-41d4-a716-446655440002', (SELECT id FROM genres WHERE name = 'Alternative')),
    ('850e8400-e29b-41d4-a716-446655440002', (SELECT id FROM genres WHERE name = 'Pop')),
    
    -- Tití Me Preguntó (Reggaeton, Latin)
    ('850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM genres WHERE name = 'Reggaeton')),
    ('850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM genres WHERE name = 'Latin')),
    
    -- Midnight Rain (Pop, Alternative)
    ('850e8400-e29b-41d4-a716-446655440004', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440004', (SELECT id FROM genres WHERE name = 'Alternative')),
    
    -- Eternal Sunshine (Pop, R&B)
    ('850e8400-e29b-41d4-a716-446655440005', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440005', (SELECT id FROM genres WHERE name = 'R&B / Soul')),
    
    -- Levitating (Pop, Electronic, Disco)
    ('850e8400-e29b-41d4-a716-446655440006', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440006', (SELECT id FROM genres WHERE name = 'Electronic')),
    
    -- Save Your Tears (Pop, Synthwave)
    ('850e8400-e29b-41d4-a716-446655440007', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440007', (SELECT id FROM genres WHERE name = 'Electronic')),
    
    -- My Future (Hip-Hop, Lo-Fi)
    ('850e8400-e29b-41d4-a716-446655440008', (SELECT id FROM genres WHERE name = 'Hip-Hop')),
    ('850e8400-e29b-41d4-a716-446655440008', (SELECT id FROM genres WHERE name = 'Lo-Fi')),
    
    -- Bad Idea (Reggaeton, Hip-Hop)
    ('850e8400-e29b-41d4-a716-446655440009', (SELECT id FROM genres WHERE name = 'Reggaeton')),
    ('850e8400-e29b-41d4-a716-446655440009', (SELECT id FROM genres WHERE name = 'Hip-Hop')),
    
    -- Anti-Hero (Pop, Alternative)
    ('850e8400-e29b-41d4-a716-446655440010', (SELECT id FROM genres WHERE name = 'Pop')),
    ('850e8400-e29b-41d4-a716-446655440010', (SELECT id FROM genres WHERE name = 'Alternative'));

-- ─────────────────────────────────────────────────────────────────────────────
-- SONG_MOODS (asociar moods a canciones)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO song_moods (song_id, mood_id, score) VALUES
    -- Blinding Lights -> Energía, Fiesta
    ('850e8400-e29b-41d4-a716-446655440001', (SELECT id FROM moods WHERE name = 'energia'), 0.95),
    ('850e8400-e29b-41d4-a716-446655440001', (SELECT id FROM moods WHERE name = 'fiesta'), 0.88),
    
    -- When We Were Young -> Nostalgia, Focus
    ('850e8400-e29b-41d4-a716-446655440002', (SELECT id FROM moods WHERE name = 'relax'), 0.92),
    ('850e8400-e29b-41d4-a716-446655440002', (SELECT id FROM moods WHERE name = 'focus'), 0.85),
    
    -- Tití Me Preguntó -> Fiesta, Energía
    ('850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM moods WHERE name = 'fiesta'), 0.96),
    ('850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM moods WHERE name = 'energia'), 0.91),
    
    -- Midnight Rain -> Triste, Romance
    ('850e8400-e29b-41d4-a716-446655440004', (SELECT id FROM moods WHERE name = 'triste'), 0.87),
    ('850e8400-e29b-41d4-a716-446655440004', (SELECT id FROM moods WHERE name = 'romance'), 0.79),
    
    -- Eternal Sunshine -> Feliz, Romance
    ('850e8400-e29b-41d4-a716-446655440005', (SELECT id FROM moods WHERE name = 'feliz'), 0.89),
    ('850e8400-e29b-41d4-a716-446655440005', (SELECT id FROM moods WHERE name = 'romance'), 0.85),
    
    -- Levitating -> Fiesta, Energía
    ('850e8400-e29b-41d4-a716-446655440006', (SELECT id FROM moods WHERE name = 'fiesta'), 0.97),
    ('850e8400-e29b-41d4-a716-446655440006', (SELECT id FROM moods WHERE name = 'energia'), 0.94),
    
    -- Save Your Tears -> Romance, Triste
    ('850e8400-e29b-41d4-a716-446655440007', (SELECT id FROM moods WHERE name = 'romance'), 0.88),
    ('850e8400-e29b-41d4-a716-446655440007', (SELECT id FROM moods WHERE name = 'triste'), 0.82),
    
    -- My Future -> Focus, Relax
    ('850e8400-e29b-41d4-a716-446655440008', (SELECT id FROM moods WHERE name = 'focus'), 0.90),
    ('850e8400-e29b-41d4-a716-446655440008', (SELECT id FROM moods WHERE name = 'relax'), 0.86),
    
    -- Bad Idea -> Energía, Fiesta
    ('850e8400-e29b-41d4-a716-446655440009', (SELECT id FROM moods WHERE name = 'energia'), 0.92),
    ('850e8400-e29b-41d4-a716-446655440009', (SELECT id FROM moods WHERE name = 'fiesta'), 0.87),
    
    -- Anti-Hero -> Triste, Relax
    ('850e8400-e29b-41d4-a716-446655440010', (SELECT id FROM moods WHERE name = 'triste'), 0.89),
    ('850e8400-e29b-41d4-a716-446655440010', (SELECT id FROM moods WHERE name = 'relax'), 0.81);

-- ─────────────────────────────────────────────────────────────────────────────
-- LIKED SONGS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO liked_songs (user_id, song_id, liked_at) VALUES
    -- Juan le gustan: Blinding Lights, Levitating, Anti-Hero
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', NOW() - INTERVAL '1 day'),
    
    -- María le gustan: When We Were Young, Save Your Tears, Eternal Sunshine
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '7 days'),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 day'),
    
    -- Carlos le gustan: Tití Me Preguntó, Bad Idea, My Future
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '6 days'),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440009', NOW() - INTERVAL '4 days'),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440008', NOW() - INTERVAL '2 days');

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAYLISTS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO playlists (id, owner_id, name, description, cover_url, visibility, mood_id) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mi Fiesta', 'Las mejores canciones para bailar', 'https://i.scdn.co/image/ab67616d0000b273f8dd0e6f5e5e5e5e5e5e5e5e', 'public', (SELECT id FROM moods WHERE name = 'fiesta')),
    ('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Focus Time', 'Música para concentrarse', 'https://i.scdn.co/image/ab67616d0000b2735e5e5e5e5e5e5e5e5e5e5e5e', 'private', (SELECT id FROM moods WHERE name = 'focus')),
    ('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Románticas', 'Canciones de amor', 'https://i.scdn.co/image/ab67616d0000b2735a5a5a5a5a5a5a5a5a5a5a5a', 'public', (SELECT id FROM moods WHERE name = 'romance')),
    ('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Reggaeton Top', 'Reggaeton más escuchado', 'https://i.scdn.co/image/ab67616d0000b2734f4f4f4f4f4f4f4f4f4f4f4f', 'public', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAYLIST_SONGS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO playlist_songs (playlist_id, song_id, position, added_at) VALUES
    -- Mi Fiesta (Juan)
    ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 1, NOW() - INTERVAL '10 days'),
    ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440006', 2, NOW() - INTERVAL '9 days'),
    ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', 3, NOW() - INTERVAL '8 days'),
    ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440009', 4, NOW() - INTERVAL '5 days'),
    
    -- Focus Time (Juan)
    ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440008', 1, NOW() - INTERVAL '7 days'),
    ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', 2, NOW() - INTERVAL '6 days'),
    
    -- Románticas (María)
    ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440007', 1, NOW() - INTERVAL '12 days'),
    ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440005', 2, NOW() - INTERVAL '10 days'),
    ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 3, NOW() - INTERVAL '8 days'),
    
    -- Reggaeton Top (Carlos)
    ('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440003', 1, NOW() - INTERVAL '11 days'),
    ('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440009', 2, NOW() - INTERVAL '9 days');

-- ─────────────────────────────────────────────────────────────────────────────
-- LISTENING_HISTORY
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO listening_history (user_id, song_id, mood_id, duration_s, completed, listened_at) VALUES
    -- Juan escuchó
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', (SELECT id FROM moods WHERE name = 'energia'), 200.34, true, NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440006', (SELECT id FROM moods WHERE name = 'fiesta'), 203.23, true, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM moods WHERE name = 'fiesta'), 150.0, false, NOW() - INTERVAL '1 day'),
    
    -- María escuchó
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440007', (SELECT id FROM moods WHERE name = 'romance'), 215.34, true, NOW() - INTERVAL '4 days'),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440005', (SELECT id FROM moods WHERE name = 'feliz'), 212.67, true, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', (SELECT id FROM moods WHERE name = 'relax'), 192.45, true, NOW() - INTERVAL '1 day'),
    
    -- Carlos escuchó
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440008', (SELECT id FROM moods WHERE name = 'focus'), 186.45, true, NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440009', (SELECT id FROM moods WHERE name = 'energia'), 245.12, true, NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', (SELECT id FROM moods WHERE name = 'fiesta'), 268.56, true, NOW() - INTERVAL '2 days');

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAYER_STATE
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO player_state (user_id, current_song_id, position_s, repeat, shuffle, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 45.5, 'none', false, NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440007', 120.0, 'one', false, NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440009', 0, 'all', true, NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- DOWNLOADS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO downloads (user_id, song_id, status, file_size_bytes, local_path, downloaded_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'completed', 5242880, '/music/downloads/blinding-lights.mp3', NOW() - INTERVAL '7 days'),
    ('550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440006', 'completed', 4718592, '/music/downloads/levitating.mp3', NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440007', 'downloading', 2097152, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', 'completed', 6291456, '/music/downloads/titi-me-pregunto.mp3', NOW() - INTERVAL '3 days');

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificar datos insertados
-- ─────────────────────────────────────────────────────────────────────────────

SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as artists_count FROM artists;
SELECT COUNT(*) as songs_count FROM songs;
SELECT COUNT(*) as playlists_count FROM playlists;
SELECT COUNT(*) as liked_songs_count FROM liked_songs;
SELECT COUNT(*) as listening_history_count FROM listening_history;
