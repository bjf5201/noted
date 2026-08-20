import { Static, Type } from 'typebox';

// Building blocks
const noteIdSchema = Type.Integer();
const noteTitleSchema = Type.String({
  minLength: 1,
  maxLength: 200,
});
const noteContentSchema = Type.String({
  minLength: 1,
});

const NoteSchema = Type.Object({
  noteId: noteIdSchema,
  title: noteTitleSchema,
  content: noteContentSchema,
});

const CreateNoteBodySchema = Type.Object({
  title: noteTitleSchema,
  content: noteContentSchema,
});

const GetNoteByIdParamsSchema = Type.Object({
  noteId: noteIdSchema,
});

// GET /notes endpoint
export const listNotesRouteSchema = {
  description: 'List notes',
  response: {
    200: Type.Array(NoteSchema),
  },
};

// GET /notes/:noteId endpoint
export const listNoteByIdRouteSchema = {
  description: 'List single note by id',
  params: GetNoteByIdParamsSchema,
  response: {
    200: NoteSchema,
  },
};

// POST /notes endpooint
export const createNoteRouteSchema = {
  description: 'Create a note',
  body: CreateNoteBodySchema,
  response: {
    201: NoteSchema,
  },
};

export type TGetNoteByIdParams = Static<typeof GetNoteByIdParamsSchema>;
