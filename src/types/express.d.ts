declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }

    interface UploadedFile {
      path: string;
      fileName: string;
    }

    interface Request {
      user?: User;
      uploadedFile: UploadedFile;
    }
  }
}

export {};
