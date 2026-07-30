import { Type } from 'typebox';

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

export const NoteSummarySchema = Type.Object({
  id: noteId,
  title: noteTitle,
});

export const CreateNoteBodySchema = Type.Object({
  title: noteTitle,
  content: noteContent,
});

// GET /notes endpoint
export const listNotesRouteSchema = {
  summary: 'List notes (summary version)',
  response: {
    200: Type.Array(NoteSchema),
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
