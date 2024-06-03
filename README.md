<p align="center"><img src="apps/docs/readme-files/MAGICK-banner.png" /></p>

<p align="center">
  <a href="https://www.youtube.com/@magickml">
    <img src="https://img.shields.io/badge/YouTube-Subscribe-red?style=social&logo=youtube" alt="Subscribe on YouTube" />
  </a>
</p>

<h3 align = "center">Magick is a groundbreaking visual AIDE (Artificial Intelligence Development Environment) for no-code data pipelines and multimodal agents. Magick can connect to other services and comes with nodes and templates well-suited for intelligent agents, chatbots, complex reasoning systems and realistic characters.</h3>

## 🗝 Key Features

- Realtime agents which can perform actions on their own, interact with users and other agents in different modalities with a unified memory and self
- Social connectors to Discord, Twitter and Twilio -- Zoom, Google Meet, Reddit, Slack connectors will be available soon as plugins!
- Search Google, Wikipedia and the Semantic Web
- Many included powertools, including voice and image generation and vector search
- Powerful graph-based IDE for complex data pipelines
- Graphs can be embedded in subgraphs and shared for rapid community development

## 🔮 Magick: Enchanting AI App Development Made Easy

With Magick, you can unleash the power of AI without needing to know how to code. Using our intuitive environment, you can seamlessly connect to popular services and explore a world of pre-built nodes and connectors to bring your vision to life.

`Powerful enough for wizards. Easy enough for mere mortals.`

<p align="center"><img src="apps/docs/readme-files/ui.png" /></p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=Xy7tMmKluvE" target="_blank">
    <img src="https://img.youtube.com/vi/Xy7tMmKluvE/0.jpg" alt="Magick - AI for Mere Mortals" style="width:65%;max-width:640px;" />
  </a>
  <br />
  ▶️ <strong>Click the image above to watch the <a href="https://www.youtube.com/watch?v=Xy7tMmKluvE" target="_blank">video</a></strong>
</p>

<hr />

# Installation

## Setup

```
Install node 16

npm install --legacy-peer-deps
npm run dev
```

#### Build

Build will take some time initially. When everything is ready, the client will be ready at [localhost:4200](http://localhost:4200/home)

_Please be aware Magick is under heavy development which may cause breaking changes._

## Database

Magick installs [mydb.sqlite](apps/server/mydb.sqlite) by default. This is a local sqlite database. It is not recommended for production use, but is fine for development. _Database can be wiped by breaking changes, back up your spells via export regularly._

### Local Sqlite Installation:

If you want to set up a custom sqlite database, add a relative or absolute path to your sqlite file in the [`.env` file](.env)
Next migrate to the new database by running:

```
npm run migrate
```

### Deploy your own Postgres database

To deploy your own database, we suggest using Supabase or another Postgres database. The current setup for events and documents requires the [`pgvector`](https://supabase.com/docs/guides/database/extensions/pgvector) extension to be enabled.

The following documents should help you with setup:

- [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [OpenAI Embeddings- Postgres Vector](https://supabase.com/blog/openai-embeddings-postgres-vector)

### Initialize a new database

Magick uses [Feathers 5](https://feathersjs.com/) for backend, which in turn uses [Knex](https://knexjs.org/) for making database queries. We will offer a better database configuration experience in the future. For now, you will need to manually configure the database connection in the [`.env` file](.env) and then run the migration script.

```
cd apps/server
npm run migrate
```

## Self signed certificates

Developing locally, it can be very helpful to have google chrome accept all self signed cetificates coming from localhost. To do this, simply paste the following snippet into chromes URL bar and enable the feature:

`chrome://flags/#allow-insecure-localhost`

## Core Concepts

### Spells

A spell is a pipeline that describes data moivng from one place to another, running through different processes we call "nodes", via wires we call "connections". In Magick, the collection of data, nodes, variables, and presets for each graph is known as a "spell". Spell is not a machine learning term. We just like it. Spells can be imported and exported at any time. Spells in their raw form are JSON, a standard format that is easy to share.

### Nodes

At the core, Magick is a system for taking in data, doing stuff to it, and then sending the final data out. This "stuff" is called a "transformation", the data transforms from one thing into the next. The "stuff" that is happening to the data is a black box that takes something in, anything, and returns something out. We call the black box where the transformstion takes place a "node". Nodes are the building blocks of Magick.

### Creating Nodes

Nodes are created in the composer window of the "Spells" tab. You can right-click in the composer and add nodes from the context menu. You can also drag and drop nodes from the "Nodes" tab into the composer. Nodes can be dragged and dropped around the composer to re-arrange them. Nodes can be deleted by right-clicking on them and selecting "Delete".

### Node Types

- Input Node
- Prompt Template
- Code Node: Lets you define both inputs and outputs.
- Generator Node: Lets you define your own input sockets and then work with that data inside of the node.
- Wait For All Node: Used to wait for different execution branches to complete before joining back into a single branch -- this is a good way to do several slow tasks at once.

### Inputs and Outputs

All nodes have some inputs and/or outputs, although they don't necessarily have to have both. Inputs and outputs are visually displayed as sockets. The color of the socket determines the type of data it can receive, with "gray" being the default untyped or "any" type.

### Sockets

Data passed into sockets is available to the node, it can process that data, do something to it, and return the result to the output socket. Some nodes (like Generator node) let you define your own input sockets and then work with that data inside of the node. Some nodes (like the Code node) let you define both inputs and outputs.

### Triggers

Triggers tell nodes to start asynchronous tasks. Some nodes can process data without needing a trigger, but most nodes need triggers. Triggers can be emitted from one socket out to more than one input, however the order of execution is not guaranteed. You can use the "Wait For All" node to wait for different execution branches to complete before joining back into a single branch -- this is a good way to do several slow tasks at once

<p align="center"><img src="apps/docs/readme-files/wizard.png" /></p>
