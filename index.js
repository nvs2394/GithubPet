'use strict'
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { 
  GraphQLID,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull, 
  GraphQLInputObjectType
} = require('graphql');

const { nodeInterface } = require('./src/node');

const { getVideoById, getVideos, createVideo } = require('./src/data/index.js');

const PORT = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
  name: "Video",
  description: "A video on Egghead.io",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "The Id of video"
    },
    title: {
      type: GraphQLString,
      description: "The title of video"
    },
    duration: {
      type: GraphQLInt,
      description: "The duration of video"
    },
    watched: {
      type: GraphQLBoolean,
      description: "Whether or not viewer has watched the video"
    }
  },
  interfaces: [nodeInterface]
})

exports.videoType = videoType;

const queryType =  new GraphQLObjectType({
  name: "QueryType",
  description: "The root query type",
  fields: {
    videos: {
      type: new GraphQLList(videoType),
      resolve: () => {
        return getVideos();
      }
    },
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: "The id of video"
        }
      },
      resolve: (_, args) => {
        return getVideoById(args.id);
      }
    }
  }
})

const videoInputType = new GraphQLInputObjectType({
  name: "InputType",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "The id of video"
    },
    title: {
      type: GraphQLString,
      description: "The title of video"
    },
    duration: {
      type: GraphQLInt,
      description: "The duration of video"
    },
    watched: {
      type: GraphQLBoolean,
      description: "Whether or not viewer has watched the video"
    }
  }
})

const mutationType = new GraphQLObjectType({
  name: "MutationType",
  description: "The root mutation type",
  fields: {
    createVideo: {
      type: videoType,
      args: {
        video: {
          type: new GraphQLNonNull(videoInputType)
        }
      },
      resolve: (_, args) => {
        return createVideo(args.video)
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
})

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

server.listen(PORT, () => {
  console.log(`***graphQL** is running on PORT ${PORT}`)
});