import { faker } from '@faker-js/faker';

const createRandomUser = () => ({
  userId: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
});

export default () => {
  faker.seed(123);
  return faker.helpers.multiple(createRandomUser, {
    count: 100,
  });
};
