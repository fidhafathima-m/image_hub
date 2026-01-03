import { AuthController } from "../controllers/authController.js";
import { ImageController } from "../controllers/imageController.js";
import { ImageRepository } from "../repositories/image.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";
import { ImageService } from "../services/image.service.js";

const userRepository = new UserRepository()
const authService = new AuthService(userRepository);
const authController = new AuthController(authService)

const imageRepository = new ImageRepository();
const imageService = new ImageService(imageRepository);
const imageController = new ImageController(imageService)

export {
    userRepository,
    authService,
    authController,
    imageRepository,
    imageService,
    imageController
}