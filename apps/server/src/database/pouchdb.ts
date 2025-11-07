/**
 * PouchDB/CouchDB database connection and utilities
 */

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterHttp from 'pouchdb-adapter-http';

import { config } from '../config/environment';
import { logger } from '../utils/logger';

// Add plugins
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterHttp);

// Local database instance
let localDb: PouchDB.Database | null = null;

// Remote database instance (CouchDB)
let remoteDb: PouchDB.Database | null = null;

// Sync handler
let syncHandler: PouchDB.Replication.Sync<{}> | null = null;

/**
 * Initializes local PouchDB database
 */
export function initializeLocalDatabase(dbName: string = 'taktak_local'): PouchDB.Database {
  if (localDb) {
    return localDb;
  }

  logger.info(`Initializing local database: ${dbName}`);

  localDb = new PouchDB(dbName, {
    auto_compaction: true,
  });

  // Create indexes for common queries
  createIndexes(localDb).catch((error) => {
    logger.error('Failed to create indexes', { error: error.message });
  });

  logger.info('Local database initialized');
  return localDb;
}

/**
 * Initializes remote CouchDB connection
 */
export function initializeRemoteDatabase(): PouchDB.Database | null {
  if (!config.features.cloudSync) {
    logger.info('Cloud sync disabled, skipping remote database initialization');
    return null;
  }

  if (remoteDb) {
    return remoteDb;
  }

  const { url, user, password, database } = config.couchdb;
  const remoteUrl = `${url}/${database}`;

  logger.info(`Connecting to remote database: ${remoteUrl}`);

  remoteDb = new PouchDB(remoteUrl, {
    auth: {
      username: user,
      password: password,
    },
    skip_setup: false,
  });

  logger.info('Remote database connected');
  return remoteDb;
}

/**
 * Creates database indexes for efficient queries
 */
async function createIndexes(db: PouchDB.Database): Promise<void> {
  const indexes = [
    { fields: ['type'] },
    { fields: ['type', 'createdAt'] },
    { fields: ['type', 'status'] },
    { fields: ['workflowId'] },
    { fields: ['workflowId', 'createdAt'] },
  ];

  for (const index of indexes) {
    try {
      await db.createIndex({ index });
      logger.debug('Created index', { fields: index.fields });
    } catch (error) {
      logger.warn('Failed to create index', {
        fields: index.fields,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

/**
 * Starts bidirectional sync between local and remote databases
 */
export function startSync(): PouchDB.Replication.Sync<{}> | null {
  if (!localDb || !remoteDb) {
    logger.warn('Cannot start sync: databases not initialized');
    return null;
  }

  if (syncHandler) {
    logger.info('Sync already running');
    return syncHandler;
  }

  logger.info('Starting database sync');

  syncHandler = localDb
    .sync(remoteDb, {
      live: true,
      retry: true,
      batch_size: 100,
    })
    .on('change', (info: any) => {
      logger.debug('Sync change', {
        direction: info.direction,
        docsWritten: info.change.docs_written,
      });
    })
    .on('paused', () => {
      logger.debug('Sync paused (caught up)');
    })
    .on('active', () => {
      logger.debug('Sync active (replicating)');
    })
    .on('error', (error: any) => {
      logger.error('Sync error', { error: error.message });
    });

  return syncHandler;
}

/**
 * Stops database sync
 */
export function stopSync(): void {
  if (syncHandler) {
    logger.info('Stopping database sync');
    syncHandler.cancel();
    syncHandler = null;
  }
}

/**
 * Gets the local database instance
 */
export function getLocalDatabase(): PouchDB.Database {
  if (!localDb) {
    return initializeLocalDatabase();
  }
  return localDb;
}

/**
 * Gets the remote database instance
 */
export function getRemoteDatabase(): PouchDB.Database | null {
  return remoteDb;
}

/**
 * Closes database connections
 */
export async function closeDatabases(): Promise<void> {
  logger.info('Closing database connections');

  stopSync();

  if (localDb) {
    await localDb.close();
    localDb = null;
  }

  if (remoteDb) {
    await remoteDb.close();
    remoteDb = null;
  }

  logger.info('Database connections closed');
}

/**
 * Compacts database to reclaim space
 */
export async function compactDatabase(db: PouchDB.Database): Promise<void> {
  logger.info('Compacting database');
  await db.compact();
  logger.info('Database compacted');
}

/**
 * Gets database info
 */
export async function getDatabaseInfo(
  db: PouchDB.Database
): Promise<PouchDB.Core.DatabaseInfo> {
  return await db.info();
}

/**
 * Checks if remote database is accessible
 */
export async function checkRemoteConnection(): Promise<boolean> {
  if (!remoteDb) {
    return false;
  }

  try {
    await remoteDb.info();
    return true;
  } catch (error) {
    logger.error('Remote database not accessible', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export default {
  initializeLocalDatabase,
  initializeRemoteDatabase,
  startSync,
  stopSync,
  getLocalDatabase,
  getRemoteDatabase,
  closeDatabases,
  compactDatabase,
  getDatabaseInfo,
  checkRemoteConnection,
};

