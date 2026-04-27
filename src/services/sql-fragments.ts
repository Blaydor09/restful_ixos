export function songSelect(likedSql = 'FALSE') {
  return `
    s.id,
    s.file_id AS "fileId",
    s.file_path AS "filePath",
    s.cdn_url AS "cdnUrl",
    s.preview_url AS "previewUrl",
    s.title,
    s.track_number AS "trackNumber",
    s.cover_url AS "coverUrl",
    COALESCE(s.cover_url, al.cover_url) AS "artworkUrl",
    s.release_year AS "releaseYear",
    s.explicit,
    s.play_count AS "playCount",
    s.duration_s AS "durationS",
    s.bitrate,
    s.sample_rate AS "sampleRate",
    s.channels,
    s.bpm,
    s.musical_key AS "musicalKey",
    s.time_signature AS "timeSignature",
    s.energy,
    s.valence,
    s.acousticness,
    s.instrumentalness AS "instrumentalness",
    s.loudness_db AS "loudnessDb",
    s.waveform_data AS "waveformData",
    s.streamable,
    s.downloadable,
    s.created_at AS "createdAt",
    s.updated_at AS "updatedAt",
    json_build_object(
      'id', ar.id,
      'name', ar.name,
      'imageUrl', ar.image_url,
      'verified', ar.verified,
      'monthlyListeners', ar.monthly_listeners
    ) AS artist,
    CASE
      WHEN al.id IS NULL THEN NULL
      ELSE json_build_object(
        'id', al.id,
        'title', al.title,
        'coverUrl', al.cover_url,
        'releaseDate', al.release_date,
        'releaseYear', al.release_year,
        'totalTracks', al.total_tracks
      )
    END AS album,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', g.id,
          'name', g.name,
          'colorHex', g.color_hex,
          'iconName', g.icon_name
        )
        ORDER BY g.name
      )
      FROM song_genres sg
      JOIN genres g ON g.id = sg.genre_id
      WHERE sg.song_id = s.id
    ), '[]'::json) AS genres,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', m.id,
          'name', m.name,
          'displayName', m.display_name,
          'iconName', m.icon_name,
          'gradientStart', m.gradient_start,
          'gradientEnd', m.gradient_end,
          'score', sm.score
        )
        ORDER BY sm.score DESC, m.sort_order ASC
      )
      FROM song_moods sm
      JOIN moods m ON m.id = sm.mood_id
      WHERE sm.song_id = s.id
    ), '[]'::json) AS moods,
    ${likedSql} AS "isLiked"
  `;
}

export const playlistSelect = `
  p.id,
  p.name,
  p.description,
  p.cover_url AS "coverUrl",
  p.visibility,
  p.is_mood_based AS "isMoodBased",
  p.gradient_start AS "gradientStart",
  p.gradient_end AS "gradientEnd",
  p.icon_name AS "iconName",
  p.total_songs AS "totalSongs",
  p.total_duration_s AS "totalDurationS",
  p.created_at AS "createdAt",
  p.updated_at AS "updatedAt",
  json_build_object(
    'id', u.id,
    'username', u.username,
    'displayName', COALESCE(u.display_name, u.username),
    'avatarUrl', u.avatar_url
  ) AS owner,
  CASE
    WHEN m.id IS NULL THEN NULL
    ELSE json_build_object(
      'id', m.id,
      'name', m.name,
      'displayName', m.display_name,
      'iconName', m.icon_name,
      'gradientStart', m.gradient_start,
      'gradientEnd', m.gradient_end
    )
  END AS mood
`;

