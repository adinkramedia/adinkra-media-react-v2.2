export default {
  name: 'album',
  title: 'Album / Collection',
  type: 'document',

  fields: [
    { 
      name: 'title', 
      title: 'Title', 
      type: 'string' 
    },

    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' }
    },

    // 👤 NEW — Contributor relationship
    {
      name: 'contributor',
      title: 'Contributor',
      type: 'reference',
      to: [{ type: 'contributor' }]
    },

    { 
      name: 'coverImage', 
      title: 'Cover Image', 
      type: 'image',
      options: {
        hotspot: true
      }
    },

    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    },

    // 🔗 Tracks Included
    {
      name: 'tracks',
      title: 'Tracks Included',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'audioTrack' }]
        }
      ]
    },

    // 🎥 Video demos
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

    // 🎧 Multiple preview files
    {
      name: 'previewAudio',
      title: 'Preview Audio',
      type: 'array',
      of: [{ type: 'file' }]
    },

    {
      name: 'freeDownload',
      title: 'Free Download?',
      type: 'boolean',
      initialValue: false
    },

    {
      name: 'affiliateLinks',
      title: 'Affiliate Links',
      type: 'array',
      of: [{ type: 'block' }]
    },

   // 🗂 Category
{
  name: 'category',
  title: 'Category',
  type: 'string',
  options: {
    list: [
      { title: 'Drum Pack', value: 'drum-pack' },
      { title: 'Ambient Pack', value: 'ambient-pack' },
      { title: 'Traditional Instruments', value: 'traditional-instruments' },
      { title: 'Cinematic Pack', value: 'cinematic-pack' },
      { title: 'Sound FX Pack', value: 'sound-fx-pack' },
      { title: 'Sound Design Pack', value: 'sound-design-pack' },
      { title: 'Synth Pack', value: 'synth-pack' },
      { title: 'Drum Library', value: 'drum-library' },

      { title: 'Atmosphere Pack', value: 'atmosphere-pack' },
      { title: 'Drone Pack', value: 'drone-pack' },
      { title: 'Field Recording Pack', value: 'field-recording-pack' }
    ]
  }
},

// 🎼 Genre tags
{
  name: 'packGenre',
  title: 'Pack Genre',
  type: 'array',
  of: [{ type: 'string' }],
  options: {
    list: [
      'Cinematic',
      'Ambient',
      'Traditional',
      'Electronic',
      'Orchestral',
      'World',
      'Ancient',

      'Drone',
      'Texture',
      'Atmosphere',
      'Transition',
      'Impact',
      'Whoosh',
      'Riser',
      'Downer',

      'Sci-Fi',
      'Fantasy',
      'Horror',
      'Industrial',
      'Tribal',
      'Hybrid',

      'Loop',
      'Underscore',
      'Trailer',
      'Pulse',
      'Percussion'
    ]
  }
},

// 🎭 Pack Mood
{
  name: 'packMood',
  title: 'Pack Mood',
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
      'Ancient',

      'Aggressive',
      'Atmospheric',
      'Dreamy',
      'Emotional',
      'Ethereal',
      'Foreboding',
      'Mysterious',
      'Powerful',
      'Sad',
      'Hopeful',
      'Tense'
    ]
  }
},

{
  name: 'totalFiles',
  title: 'Total Files',
  type: 'number'
},

    // 🔥 Multiple download links
    {
      name: 'downloadUrls',
      title: 'Download URLs',
      description:
        'Add one or more download links (full pack, stems, bonus files, etc.)',
      type: 'array',
      of: [
        {
          type: 'url',
          title: 'Download Link'
        }
      ]
    },

    {
      name: 'releaseDate',
      title: 'Release Date',
      type: 'datetime'
    },

    {
      name: 'price',
      title: 'Price (Dollar)',
      type: 'number'
    }
  ],

  preview: {
    select: {
      title: 'title',
      contributor: 'contributor.name',
      media: 'coverImage'
    },

    prepare(selection: { title?: string; contributor?: string; media?: any }) {
      const { title, contributor, media } = selection;

      return {
        title,
        subtitle: contributor
          ? `by ${contributor}`
          : 'No contributor assigned',
        media
      };
    }
  }
}