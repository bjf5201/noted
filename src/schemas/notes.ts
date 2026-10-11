import { Static, Type } from 'typebox';
import {
  DateTimeSchema,
  IdSchema,
  LongStringSchema,
  ShortStringSchema
} from './shared.js';

export interface Note extends Static<typeof NoteSchema> {
  filename?: string | null;
}

export const NoteSchema = Type.Object({
  id: IdSchema,
  userId: IdSchema,
  title: ShortStringSchema,
  content: LongStringSchema,
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
