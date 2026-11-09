import { Static, Type } from 'typebox';
import {
  DateTimeSchema,
  IdSchema,
  LongStringSchema,
  ShortStringSchema
} from './shared/patterns.js';

export const NoteEntitySchema = Type.Object({
  id: IdSchema,
  userId: IdSchema,
  title: ShortStringSchema,
  content: LongStringSchema,
  filename: Type.Optional(Type.String()),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

export const CreateNoteSchema = Type.Object({
  title: ShortStringSchema,
  content: LongStringSchema
});

export const UpdateNoteSchema = Type.Object({
  title: Type.Optional(ShortStringSchema),
  content: Type.Optional(LongStringSchema)
});

export type NoteEntity = Static<typeof NoteEntitySchema>;
