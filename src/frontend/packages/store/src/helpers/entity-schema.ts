import { Schema, schema } from 'normalizr';

import { EntityCatalogueHelpers } from '../../../core/src/core/entity-catalogue/entity-catalogue.helper';
import { EntityCatalogueEntityConfig } from '../../../core/src/core/entity-catalogue/entity-catalogue.types';

/**
 * Mostly a wrapper around schema.Entity. Allows a lot of uniformity of types through console. Includes some minor per entity type config
 *
 * @export
 * @extends {schema.Entity}
 */
export class EntitySchema extends schema.Entity implements EntityCatalogueEntityConfig {
  schema: Schema;
  schemaKey: string;
  public getId: (input, parent?, key?) => string;
  /**
   * @param entityKey As per schema.Entity ctor
   * @param [definition] As per schema.Entity ctor
   * @param [options] As per schema.Entity ctor
   * @param [relationKey] Allows multiple children of the same type within a single parent entity. For instance user with developer
   * spaces, manager spaces, auditor space, etc
   */
  constructor(
    public entityType: string,
    public endpointType: string,
    public definition?: Schema,
    private options?: schema.EntityOptions,
    public relationKey?: string,
    schemaKey?: string
  ) {
    super(endpointType ? EntityCatalogueHelpers.buildEntityKey(entityType, endpointType) : entityType, definition, options);
    this.schema = definition || {};
    this.schemaKey = schemaKey;
  }
  public withEmptyDefinition() {
    return new EntitySchema(
      this.entityType,
      this.endpointType,
      {},
      this.options,
      this.relationKey
    );
  }
  public clone() {
    return new EntitySchema(
      this.entityType,
      this.endpointType,
      this.definition,
      this.options,
      this.relationKey,
      this.schemaKey
    );
  }
}