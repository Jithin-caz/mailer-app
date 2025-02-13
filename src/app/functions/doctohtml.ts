import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const getMailContent = async () => {
  const filePath = path.join(process.cwd(), "public", "disec.docx");
  const buffer = fs.readFileSync(filePath);

  const { value: htmlContent } = await mammoth.convertToHtml({ buffer });
  return htmlContent;
};
//delegatename