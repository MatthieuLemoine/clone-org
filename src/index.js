import fs from 'fs';
import path from 'path';
import { GraphQLClient } from 'graphql-request';
import { argv } from 'yargs';
import { spawn } from 'child_process';
import { promisify } from 'util';

const { token, org, dir } = argv;

if (!token) {
  console.error('Missing personal access token. Use --token.');
  process.exit(1);
}
if (!org) {
  console.error('Missing organization name. Use --org.');
  process.exit(1);
}

const directory = path.resolve(dir || process.cwd());

const endpoint = 'https://api.github.com/graphql';

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const repositoriesQuery = `query getRepositories($organization: String!) {
  organization(login: $organization) {
    repositories(last: 100) {
      edges {
        node {
          name
          isArchived
        }
      }
    }
  }
}`;

run();

async function run() {
  try {
    console.log(
      `All repositories of the ${org} organization will be cloned in '${directory}`
    );
    if (!fs.existsSync(directory)) {
      await promisify(fs.mkdir)(directory);
    }
    const repositories = await getRepositories(org);
    await Promise.all(
      repositories.map(async repository => {
        const repositoryPath = path.join(directory, repository);
        if (fs.existsSync(repositoryPath)) {
          console.log(
            `${repositoryPath} already exists. ${repository} will not be cloned.`
          );
          return;
        }
        console.log(`Cloning ${repository} in ${repositoryPath}.`);
        await clone(`${org}/${repository}`);
        console.log(`${repository} has been cloned.`);
      })
    );
  } catch (e) {
    console.error(e);
  }
}

async function getRepositories(organization) {
  const response = await client.request(repositoriesQuery, { organization });
  return response.organization.repositories.edges
    .filter(item => !item.node.isArchived)
    .map(item => item.node.name);
}

function clone(repository) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['clone', `git@github.com:${repository}`], {
      cwd: directory,
      stdio: 'inherit',
    });
    child.on('close', code => {
      if (code !== 0) {
        return reject(
          `Error while cloning ${repository}. Child process exited with error code ${code}`
        );
      }
      return resolve();
    });
  });
}
