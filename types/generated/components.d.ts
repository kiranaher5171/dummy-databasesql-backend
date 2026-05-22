import type { Schema, Struct } from '@strapi/strapi';

export interface ReusableHeaderAndList extends Struct.ComponentSchema {
  collectionName: 'components_reusable_header_and_lists';
  info: {
    displayName: 'header_and_list';
  };
  attributes: {
    header: Schema.Attribute.Text;
    rich_text: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'reusable.header-and-list': ReusableHeaderAndList;
    }
  }
}
