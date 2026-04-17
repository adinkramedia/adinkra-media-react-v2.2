import {defineField, defineType} from 'sanity'

export const audioComparison = defineType({
  name: 'audioComparison',
  title: 'Audio Mix Comparison',
  type: 'document',
  icon: () => '🎛️', // optional, you can use any emoji or import an icon

  fields: [
    defineField({
      name: 'title',
      title: 'Track Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }], // Portable text for rich description
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Soundtracks', value: 'soundtracks' },
          { title: 'Cinematic', value: 'cinematic' },
          { title: 'Ambient', value: 'ambient' },
          { title: 'World/Traditional', value: 'world-traditional' },
          // Add more as needed
        ],
      },
    }),
    defineField({
      name: 'rawMix',
      title: 'Raw Mix (Before)',
      type: 'file',
      options: {
        accept: 'audio/*', // mp3, wav, etc.
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'cleanMix',
      title: 'Clean Mix (After - Mastered)',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Gallery',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    // Optional: thumbnail for the card
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: {
      title: 'title',
      raw: 'rawMix.asset->originalFilename',
      clean: 'cleanMix.asset->originalFilename',
      media: 'thumbnail',
    },
    prepare(selection) {
      const { title, raw, clean } = selection
      return {
        title: title || 'Untitled Comparison',
        subtitle: `Raw: ${raw || '—'} → Clean: ${clean || '—'}`,
        media: selection.media,
      }
    },
  },
})