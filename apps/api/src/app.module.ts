import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
// P2+: ToolsModule, SearchModule, ReviewsModule, VerificationModule, EnrichmentModule
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true })] })
export class AppModule {}
