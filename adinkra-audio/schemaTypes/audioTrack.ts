export default {
  name: 'audioTrack',
  title: 'Audio Track',
  type: 'document',
  fields: [
    // Core
    { name: 'title', title: 'Track Title', type: 'string' },

    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 }
    },

    // Media
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true }
    },
    { name: 'previewAudio', title: 'Preview Audio', type: 'file' },
    { name: 'fullDownload', title: 'Full Download File', type: 'file' },

    // Pricing & Access
    { name: 'price', title: 'Price (Dollar)', type: 'number' },
    { name: 'freeDownload', title: 'Free Download?', type: 'boolean' },

    // 🔗 RELATION: Album (NEW)
    {
      name: 'album',
      title: 'Album / Collection',
      type: 'reference',
      to: [{ type: 'album' }]
    },

    // 🔗 RELATION: Video Demos (NEW)
    {
      name: 'videoDemos',
      title: 'Video Demos',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'videoDemo' }]
        }
      ]
    },

    // Classification
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Music', value: 'music' },
          { title: 'Scores and Cinematic', value: 'scores-cinematic' },
          { title: 'Meditation', value: 'meditation' },
          { title: 'World and Traditional', value: 'world-traditional' },
          { title: 'Sound Effects', value: 'sound-effects' },
          { title: 'Ambient', value: 'ambient' }
        ]
      }
    },

    {
      name: 'genre',
      title: 'Genre',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Cinematic', value: 'cinematic' },
          { title: 'Ambient', value: 'ambient' },
          { title: 'Traditional', value: 'traditional' },
          { title: 'Electronic', value: 'electronic' },
          { title: 'Orchestral', value: 'orchestral' },
          { title: 'World', value: 'world' },
          { title: 'Ancient', value: 'ancient' }
        ]
      }
    },

    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    },

    // Musical Details
    {
      name: 'mood',
      title: 'Mood',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Epic',
          'Dark',
          'Mystical',
          'Spiritual',
          'Calm',
          'Suspense',
          'Heroic',
          'Meditative',
          'Ancient'
        ]
      }
    },

    {
      name: 'instruments',
      title: 'Instruments',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Balafon',
          'Bansuri',
          'Calabash',
          'Choir',
          'Darbuka',
          'Dholak',
          'Djembe',
          'Drums',
          'Dunun',
          'Ensemble',
          'Flute',
          'Frame Drums',
          'Ghatam',
          'Guitar',
          'Harmonium',
          'Harp',
          'Kora',
          'Ngoni',
          'Oud',
          'Piano',
          'Strings',
          'Synth',
          'Tabla',
          'Tanpura',
          'Xylophone',
          'Zurna'
        ]
      }
    },

    {
      name: 'bpm',
      title: 'BPM',
      type: 'number'
    },

    {
      name: 'duration',
      title: 'Duration',
      type: 'string'
    },

    {
      name: 'keyScale',
      title: 'Key / Scale',
      type: 'string'
    },

    {
      name: 'energyLevel',
      title: 'Energy Level',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' }
        ]
      }
    },

    {
      name: 'loopable',
      title: 'Loopable',
      type: 'boolean'
    },

    {
      name: 'usageType',
      title: 'Usage Type',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Film',
          'Documentary',
          'Trailer',
          'Podcast',
          'Game',
          'Meditation',
          'YouTube',
          'Commercial',
          'Any'
        ]
      }
    },

    // Content
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    },

    {
      name: 'affiliateLinks',
      title: 'Affiliate Links',
      type: 'array',
      of: [{ type: 'block' }]
    },

    // Metadata
    { name: 'featured', title: 'Featured', type: 'boolean' },

    {
      name: 'releaseDate',
      title: 'Release Date',
      type: 'datetime'
    }
  ]
}