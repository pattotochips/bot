import { REST, Routes } from 'discord.js';

const commands = [
    {
      name: 'add',
      description: 'Add a new birthday event',
    },
  ];

  const rest = new REST({ version: '10' }).setToken("MTEzNjczMTQwODgwNzc2NDExMA.Gs-EH1.qDv7p4jvtf0zjM7PRAn7JsnUkHregF70lWrolA");

  try {
    console.log('Started refreshing application (/) commands.');
  
    await rest.put(Routes.applicationCommands("1136731408807764110"), { body: commands });
  
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }