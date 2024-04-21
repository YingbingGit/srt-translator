// 引入 optionator 库
import optionator from "optionator";

const opts = optionator({
  prepend: "Usage: myprogram [options]",
  append: "Version 0.1.0",
  options: [
    {
      option: "name",
      alias: "n",
      type: "String",
      description: "Your name",
    },
    {
      option: "age",
      alias: "a",
      type: "Int",
      description: "Your age",
      default: "25",
    },
    {
      option: "env",
      alias: "e",
      type: "String",
      description: "Environment to deploy on",
      default: "development",
    },
  ],
});

try {
  const options = opts.parse(process.argv);
  console.log("Options:", options);
  console.log(`Hello, ${options.name}! You are ${options.age} years old.`);
  console.log(`Environment: ${options.env}`);
} catch (e) {
  console.error(opts.generateHelp());
  process.exit(1);
}
