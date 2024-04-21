import { GoogleTranslator } from "@translate-tools/core/translators/GoogleTranslator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { program } from "commander";

const translator = new GoogleTranslator();
const SUBTITLE_REG =
  /(\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n)(.*\n)/g;

function readSubtitle(srtFileName) {
  let subtitles = [];
  let data = readFileSync(srtFileName, "utf8");
  let result = data.matchAll(SUBTITLE_REG);
  for (const it of result) {
    subtitles.push({ timeline: it[1], content: it[2] });
  }
  return subtitles;
}

function merge(sub1, sub2) {
  const len = Math.min(sub1.length, sub2.length);
  return sub1.map((e, index) => {
    return {
      timeline: e.timeline,
      content: sub2[index].content + e.content,
    };
  });
}

async function translate(srtFileName, chineseEnglishTogether) {
  // Translate multiple strings
  const subtitles = readSubtitle(srtFileName);

  const translatedContents = await translator.translateBatch(
    subtitles.map((a) => a.content),
    "en",
    "zh-CN"
  );
  console.log(`Translate: ${translatedContents.length}`);
  let translatedSubtitles = translatedContents.map((content, index) => {
    return (
      subtitles[index].timeline +
      content +
      (chineseEnglishTogether ? subtitles[index].content : "")
    );
  });
  return translatedSubtitles;
}

async function main(args) {
  console.log(`
  #######################################################
  #                                                     #
  # Begin translation:                                  #
  #                                                     #
  #######################################################`);
  program
    .version("0.0.1")
    .requiredOption("-i, --input <file>", "The input file name.")
    .option("-o, --output <file>", "The output file name.")
    .option("-m, --mixed [mixed]", "Whether to mix Chinese and English", false);

  program.parse(process.argv);
  const opts = program.opts();
  console.log(opts.output || opts.input.replace(/\.\w+$/, ".zh.srt"));

  const lines = await translate(opts.input, opts.mixed);
  writeFileSync(
    opts.output || opts.input.replace(/\.\w+$/, ".zh.srt"),
    lines.join("\n"),
    "utf8"
  );
}

/** node index.js /path/to/xxx.srt */
main(process.argv);
