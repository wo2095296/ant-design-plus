import React from 'react';
import { graphql } from 'gatsby';
import Layout from '@site/layout';
import MainContent from '@site/components/content/main-content';
import {
  IGraphQLDemos,
  IMarkdownRemarkData,
  IAllMarkdownRemarkData
} from './interface';
import { transformerFrontMatter } from './utils';

export interface IProps {
  data: {
    markdownRemark: IMarkdownRemarkData;
    allMarkdownRemark: IAllMarkdownRemarkData;
    demos: IGraphQLDemos;
  }
}

const transformerDemos = demos => {
  if (!demos || !demos.edges) {
    return [];
  }
  return demos.edges.map(({ node }) => {
    return {
      preview: node.code,
      ...node.content,
      meta: {
        ...transformerFrontMatter(node.frontmatter),
        filename: node.fields.slug,
        path: node.fields.path,
      },
    };
  });
};

const ComponentTemplate: React.FC<IProps> = (props) => {
  const {
    data: {
      demos = {
        edges: [],
      },
      markdownRemark,
      allMarkdownRemark
    },
    ...rest
  } = props;
  const { frontmatter, fields, html, description, tableOfContents } = markdownRemark;
  const { edges } = allMarkdownRemark;

  const menus = edges
    .map(({ node }) => {
      const newFrontMatter = transformerFrontMatter(node.frontmatter);
      return {
        slug: node.fields.slug,
        meta: {
          ...newFrontMatter,
          slug: node.fields.slug,
          filename: node.fields.slug,
        },
        filename: node.fields.path,
        ...newFrontMatter,
      };
    })
    .filter(({ slug }) => !slug.includes('/demo/'));

  return (
    <Layout {...rest}>
      <MainContent
        {...rest}
        demos={transformerDemos(demos)}
        localizedPageData={{
          meta: {
            ...transformerFrontMatter(frontmatter),
            ...fields,
            filename: fields.slug,
            path: fields.path,
          },
          toc: tableOfContents,
          content: html,
          ...description
        }}
        menus={menus}
      />
    </Layout>
  )
};

export default ComponentTemplate;

export const pageQuery = graphql`
  query TemplateComponentsMarkdown($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      description
      tableOfContents(maxDepth: 3)
      frontmatter {
        title {
          zh_CN
          en_US
        }
        order
        type
      }
      fields {
        path
        slug
        modifiedTime
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//antd-plus//" }
        fields: { slug: { regex: "/^((?!/demo/).)*$/" } }
      }
      sort: { fields: [fields___slug], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            title {
              zh_CN
              en_US
            }
            order
            subtitle
            type
          }
          fields {
            slug
            path
          }
        }
      }
    }
    demos: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//antd-plus//" }
        fields: { slug: { regex: "//demo//" } }
      }
      sort: { fields: [fields___slug], order: DESC }
    ) {
      edges {
        node {
          content
          code
          frontmatter {
            title {
              zh_CN
              en_US
            }
            cols
            order
            subtitle
            type
          }
          fields {
            slug
            path
          }
        }
      }
    }
  }
`;