import { Static, Type } from 'typebox';
import {
  DateTimeSchema,
  IdSchema,
  LongStringSchema,
  NoteTitleSchema
} from '../../shared/schemas/patterns.js';

export const NoteEntitySchema = Type.Object({
  id: IdSchema,
  userId: IdSchema,
  title: NoteTitleSchema,
  content: LongStringSchema,
  filename: Type.Optional(Type.String()),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

export const CreateNoteSchema = Type.Object({
  title: NoteTitleSchema,
  content: LongStringSchema
});

export const UpdateNoteSchema = Type.Object({
  title: Type.Optional(NoteTitleSchema),
  content: Type.Optional(LongStringSchema)
});

export type NoteEntity = Static<typeof NoteEntitySchema>;
