BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[projects] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [projects_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [projects_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[import_jobs] (
    [id] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [totalLines] INT NOT NULL,
    [processedLines] INT NOT NULL CONSTRAINT [import_jobs_processedLines_df] DEFAULT 0,
    [errorLines] INT NOT NULL CONSTRAINT [import_jobs_errorLines_df] DEFAULT 0,
    [completedAt] DATETIME2,
    [projectId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [import_jobs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [import_jobs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[import_errors] (
    [id] NVARCHAR(1000) NOT NULL,
    [lineText] NVARCHAR(1000) NOT NULL,
    [lineNumber] INT NOT NULL,
    [errorMessage] NVARCHAR(1000) NOT NULL,
    [importJobId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [import_errors_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [import_errors_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[transactions] (
    [id] NVARCHAR(1000) NOT NULL,
    [amount] DECIMAL(14,2) NOT NULL,
    [currency] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [projectId] NVARCHAR(1000) NOT NULL,
    [importJobId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [transactions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [transactions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_name_idx] ON [dbo].[projects]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [import_jobs_fileName_idx] ON [dbo].[import_jobs]([fileName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [import_jobs_projectId_idx] ON [dbo].[import_jobs]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[projects] ADD CONSTRAINT [projects_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[import_jobs] ADD CONSTRAINT [import_jobs_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[import_errors] ADD CONSTRAINT [import_errors_importJobId_fkey] FOREIGN KEY ([importJobId]) REFERENCES [dbo].[import_jobs]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_importJobId_fkey] FOREIGN KEY ([importJobId]) REFERENCES [dbo].[import_jobs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
