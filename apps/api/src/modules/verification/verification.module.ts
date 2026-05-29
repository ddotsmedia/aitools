import { Module } from "@nestjs/common";
import { VerificationService } from "./verification.service";
import { VerificationController } from "./verification.controller";
import { SearchModule } from "../search/search.module";

@Module({
  imports: [SearchModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
