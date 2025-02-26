import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const getMailContent = async () => {
  const filePath = path.join(process.cwd(), "public", "disec.docx");
  const buffer = fs.readFileSync(filePath);

  const { value: htmlContent } = await mammoth.convertToHtml({ buffer });
  
  // Use absolute URL for the image
  const imageUrl = `/mun.png`; // Make sure to set BASE_URL in your environment variables
  // const htmlWithImage = htmlContent + 
  //   `<img src="${imageUrl}" alt="no image found" style="max-width: 100%; display: block; margin: 20px auto;">`;
  
  // Verify the image exists
  const imagePath = path.join(process.cwd(), "public", "mun.png");
  try {
    fs.accessSync(imagePath);
    console.log("Image exists at:", imagePath);
  } catch (error) {
    console.error("Image not found at:", imagePath);
  }

  return htmlContent;
};

export default getMailContent;
