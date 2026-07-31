import { Static, Type } from 'typebox';

// Building blocks
const noteId = Type.Integer();
const noteTitle = Type.String({
  minLength: 1,
  maxLength: 200,
});
const noteContent = Type.String({
  minLength: 1,
});

export const NoteSchema = Type.Object({
  id: noteId,
  title: noteTitle,
  content: noteContent,
});

export const CreateNoteBodySchema = Type.Object({
  title: noteTitle,
  content: noteContent,
});

export const GetNoteByIdParamsSchema = Type.Object({
  noteId: noteId,
});

// GET /notes endpoint
export const listNotesRouteSchema = {
  summary: 'List notes',
  response: {
    200: Type.Array(NoteSchema),
  },
};

// GET /nodes/:noteId endpoint
export const listNoteByIdRouteSchema = {
  summary: 'List single note by id',
  params: GetNoteByIdParamsSchema,
  response: {
    200: NoteSchema,
  },
};

// POST /notes endpooint
export const createNoteRouteSchema = {
  summary: 'Create a note',
  body: CreateNoteBodySchema,
  response: {
    201: NoteSchema,
  },
};

export type TGetNoteByIdParams = Static<typeof GetNoteByIdParamsSchema>;
